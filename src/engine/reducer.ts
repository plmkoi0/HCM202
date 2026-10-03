// Reducer thuần của game (mục 5–10, 15.3). Mọi hàm nhận `now` từ hành động
// (giờ server khi chơi qua phòng, giờ máy khi chơi trên một máy) — engine không
// đọc đồng hồ, không chạy timer; hạn thời gian lưu trong state (`deadline`).

import { cellAtStep, geometry, remainingSteps, stepBack, type Geometry } from './board'
import { botAction } from './bot'
import { answerOrder, pickQuestion } from './questions'
import { rank } from './ranking'
import { nextInt, normalizeSeed, pick, pickWeighted, shuffle } from './rng'
import type {
  Action,
  ActionResult,
  ErrorCode,
  GameConfig,
  GameConfigInput,
  GameData,
  GameEvent,
  GameSetup,
  GameState,
  Outcome,
  PlayerState,
  PowerupId,
  TurnState,
} from './types'

const LOG_SIZE = 40

class EngineError extends Error {
  readonly code: ErrorCode
  constructor(code: ErrorCode) {
    super(code)
    this.code = code
  }
}

function fail(code: ErrorCode): never {
  throw new EngineError(code)
}

// ---------- Cấu hình ----------

export function resolveConfig(data: GameData, input: GameConfigInput = {}): GameConfig {
  const d = data.rules.defaults
  const cfg: GameConfig = {
    layout: input.layout ?? d.layout ?? data.board.defaultLayout,
    timeLimitMin: input.timeLimitMin !== undefined ? input.timeLimitMin : (d.timeLimitMin ?? null),
    exactFinish: input.exactFinish ?? d.exactFinish ?? false,
    startFromStable: input.startFromStable ?? d.startFromStable ?? false,
    horsesPerPlayer: input.horsesPerPlayer ?? d.horsesPerPlayer ?? 1,
    guessAlong: input.guessAlong ?? d.guessAlong ?? false,
    afterFirstFinish: input.afterFirstFinish ?? d.afterFirstFinish ?? 'stop',
    timers: { ...data.rules.timers, ...input.timers },
  }
  if (!data.board.layouts[cfg.layout]) throw new Error(`Bố cục không hợp lệ: ${cfg.layout}`)
  if (!data.rules.timeLimitOptions.includes(cfg.timeLimitMin)) throw new Error(`Giới hạn thời gian không hợp lệ: ${cfg.timeLimitMin}`)
  if (!data.rules.options.horsesPerPlayer.includes(cfg.horsesPerPlayer)) throw new Error(`Số ngựa không hợp lệ: ${cfg.horsesPerPlayer}`)
  if (!data.rules.options.afterFirstFinish.includes(cfg.afterFirstFinish)) throw new Error(`Tùy chọn kết thúc không hợp lệ: ${cfg.afterFirstFinish}`)
  return cfg
}

// ---------- Tiện ích đọc state ----------

export function geometryOf(data: GameData, s: GameState): Geometry {
  return geometry(data, s.config.layout)
}

export function activeColors(s: GameState): Set<number> {
  return new Set(s.players.map((p) => p.color))
}

export function currentPlayer(s: GameState): PlayerState {
  const id = s.order[s.turnIndex]
  const p = s.players.find((pl) => pl.id === id)
  if (!p) throw new Error('state hỏng: không tìm thấy người đến lượt')
  return p
}

export function playerById(s: GameState, id: string): PlayerState | undefined {
  return s.players.find((p) => p.id === id)
}

export function isFinished(p: PlayerState): boolean {
  return p.finishRank !== null
}

function emptyTurn(playerId: string): TurnState {
  return {
    playerId,
    rollsDone: 0,
    sixBonusUsed: false,
    extraRolls: 0,
    doubleArmed: false,
    auto: false,
    roll: null,
    horse: null,
    from: null,
    target: null,
    question: null,
    guesses: {},
    pendingPowerup: null,
    outcome: null,
    movedThisRoll: false,
    startProgress: 0,
  }
}

function resetRoll(t: TurnState): void {
  t.roll = null
  t.horse = null
  t.from = null
  t.target = null
  t.question = null
  t.guesses = {}
  t.pendingPowerup = null
  t.outcome = null
  t.movedThisRoll = false
  t.auto = false
}

/** Tổng tiến độ các ngựa của một người (ngựa đã về đích tính là Đích) */
function progressOf(geo: Geometry, p: PlayerState): number {
  return p.horses.reduce((sum, h) => sum + (h.done ? geo.finishStep : h.step), 0)
}

function emit(s: GameState, type: string, playerId?: string, data?: Record<string, unknown>): void {
  s.eventSeq += 1
  const ev: GameEvent = { seq: s.eventSeq, type }
  if (playerId !== undefined) ev.playerId = playerId
  if (data !== undefined) ev.data = data
  s.events.push(ev)
  s.log.push(ev)
  if (s.log.length > LOG_SIZE) s.log.splice(0, s.log.length - LOG_SIZE)
}

// ---------- Hạn thời gian ----------

type DeadlineKind = 'roll' | 'choose' | 'answer' | 'reveal' | 'notice'

function setDeadline(s: GameState, p: PlayerState, kind: DeadlineKind, now: number): void {
  const t = s.config.timers
  let ms: number
  switch (kind) {
    case 'roll':
      ms = p.isBot ? t.botStepMs : p.connected ? t.rollMs : t.disconnectMs
      break
    case 'choose':
      ms = p.isBot ? t.botStepMs : t.rollMs
      break
    case 'answer':
      ms = p.isBot ? t.botStepMs : t.answerMs
      break
    case 'reveal':
      ms = t.revealMs
      break
    case 'notice':
      ms = t.noticeMs
      break
  }
  s.deadline = now + ms
}

// ---------- Tạo ván ----------

export function createGame(data: GameData, setup: GameSetup): GameState {
  const config = resolveConfig(data, setup.config)
  const geo = geometry(data, config.layout)
  const n = setup.players.length
  if (n < 1 || n > data.rules.maxPlayers) throw new Error(`Số người chơi phải từ 1 đến ${data.rules.maxPlayers}`)
  const ids = new Set<string>()
  const colors = new Set<number>()
  for (const p of setup.players) {
    if (ids.has(p.id)) throw new Error(`Trùng id người chơi ${p.id}`)
    if (colors.has(p.color)) throw new Error(`Trùng màu ${p.color}`)
    if (!Number.isInteger(p.color) || p.color < 0 || p.color >= geo.branchCount) throw new Error(`Màu không hợp lệ ${p.color}`)
    ids.add(p.id)
    colors.add(p.color)
  }
  const seed = normalizeSeed(setup.seed)
  const s: GameState = {
    schema: 1,
    version: 0,
    seed,
    rng: seed,
    config,
    players: setup.players.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      isBot: !!p.isBot,
      connected: true,
      horses: Array.from({ length: config.horsesPerPlayer }, () => ({ step: config.startFromStable ? -1 : 0, done: false })),
      bag: [],
      skipNext: false,
      finishRank: null,
      seen: [],
      stats: {
        turns: 0,
        rolls: 0,
        correct: 0,
        wrong: 0,
        timeouts: 0,
        powerupsUsed: 0,
        trapsHit: 0,
        shieldBlocks: 0,
        guessCorrect: 0,
        guessTotal: 0,
        wrongIds: [],
        stall: 0,
        maxStall: 0,
      },
    })),
    order: [],
    turnIndex: 0,
    turnNumber: 0,
    phase: 'roll',
    turn: emptyTurn(setup.players[0].id),
    deadline: null,
    startedAt: setup.now,
    endsAt: config.timeLimitMin === null ? null : setup.now + config.timeLimitMin * 60_000,
    finishOrder: [],
    usedQuestions: [],
    eventSeq: 0,
    events: [],
    log: [],
    ended: null,
  }
  // Thứ tự lượt trộn theo seed (mục 15.3)
  s.order = shuffle(s, s.players.map((p) => p.id))
  emit(s, 'gameStarted', undefined, { order: s.order.slice() })
  s.turnIndex = 0
  startTurn(data, s, setup.now)
  return s
}

// ---------- Lượt ----------

/** Bắt đầu lượt của người ở s.turnIndex; người bị "mất lượt" bỏ đúng một lượt */
function startTurn(data: GameData, s: GameState, now: number): void {
  for (let guard = 0; guard <= s.order.length * 2 + 1; guard++) {
    const p = currentPlayer(s)
    s.turnNumber += 1
    p.stats.turns += 1
    s.turn = emptyTurn(p.id)
    s.turn.startProgress = progressOf(geometryOf(data, s), p)
    if (p.skipNext) {
      p.skipNext = false
      bumpStall(p, false)
      emit(s, 'turnSkipped', p.id)
      if (!advanceToNextPlayer(s)) {
        finishGame(data, s, now, 'allFinished')
        return
      }
      continue
    }
    s.phase = 'roll'
    setDeadline(s, p, 'roll', now)
    emit(s, 'turnStarted', p.id, { turn: s.turnNumber })
    return
  }
  throw new Error('startTurn: vòng lặp bỏ lượt không kết thúc')
}

/** Chuyển s.turnIndex tới người kế tiếp chưa về đích; false nếu không còn ai */
function advanceToNextPlayer(s: GameState): boolean {
  for (let k = 1; k <= s.order.length; k++) {
    const idx = (s.turnIndex + k) % s.order.length
    const p = playerById(s, s.order[idx])
    if (p && !isFinished(p)) {
      s.turnIndex = idx
      return true
    }
  }
  return false
}

function bumpStall(p: PlayerState, advanced: boolean): void {
  if (advanced) p.stats.stall = 0
  else {
    p.stats.stall += 1
    if (p.stats.stall > p.stats.maxStall) p.stats.maxStall = p.stats.stall
  }
}

function endTurn(data: GameData, s: GameState, now: number): void {
  const p = currentPlayer(s)
  // đứng yên = cuối lượt không tiến hơn đầu lượt (kể cả bị bẫy lùi về chỗ cũ)
  bumpStall(p, progressOf(geometryOf(data, s), p) > s.turn.startProgress)
  if (s.endsAt !== null && now >= s.endsAt) {
    finishGame(data, s, now, 'time')
    return
  }
  if (!advanceToNextPlayer(s)) {
    finishGame(data, s, now, 'allFinished')
    return
  }
  startTurn(data, s, now)
}

function gameOverReason(s: GameState): 'finish' | 'allFinished' | null {
  const unfinished = s.players.filter((p) => !isFinished(p)).length
  if (s.finishOrder.length > 0 && s.config.afterFirstFinish === 'stop') return 'finish'
  if (unfinished === 0) return 'allFinished'
  if (s.players.length > 1 && unfinished <= 1 && s.finishOrder.length > 0) return 'allFinished'
  return null
}

function finishGame(data: GameData, s: GameState, now: number, reason: 'finish' | 'allFinished' | 'time' | 'host'): void {
  s.phase = 'ended'
  s.deadline = null
  s.ended = { reason, at: now, ranking: rank(data, s) }
  emit(s, 'gameEnded', undefined, { reason })
}

/** Sau khi xem kết quả một lần tung: tung thêm (ra 6 / Thêm lượt) hoặc hết lượt */
function continueTurn(data: GameData, s: GameState, now: number): void {
  const over = gameOverReason(s)
  if (over) {
    finishGame(data, s, now, over)
    return
  }
  const p = currentPlayer(s)
  const t = s.turn
  if (!isFinished(p)) {
    const bonusFace = data.rules.dice.bonusFace
    if (t.roll && t.roll.face === bonusFace && t.movedThisRoll && !t.sixBonusUsed) {
      t.sixBonusUsed = true
      startExtraRoll(s, p, now, 'six')
      return
    }
    if (t.extraRolls > 0) {
      t.extraRolls -= 1
      startExtraRoll(s, p, now, 'extraRoll')
      return
    }
  }
  endTurn(data, s, now)
}

function startExtraRoll(s: GameState, p: PlayerState, now: number, source: 'six' | 'extraRoll'): void {
  resetRoll(s.turn)
  s.phase = 'roll'
  setDeadline(s, p, 'roll', now)
  emit(s, 'bonusRoll', p.id, { source })
}

// ---------- Tung và đi ----------

function computeTarget(data: GameData, s: GameState, geo: Geometry, step: number, face: number, value: number): number | null {
  if (step < 0) {
    // Tùy chọn "Ra chuồng khi tung 1 hoặc 6" (xét mặt xúc xắc)
    return data.rules.dice.stableExitFaces.includes(face) ? 0 : null
  }
  const t = step + value
  if (t > geo.finishStep) return s.config.exactFinish ? null : geo.finishStep
  return t
}

function movableHorses(data: GameData, s: GameState, p: PlayerState, face: number, value: number): number[] {
  const geo = geometryOf(data, s)
  const res: number[] = []
  p.horses.forEach((h, i) => {
    if (!h.done && computeTarget(data, s, geo, h.step, face, value) !== null) res.push(i)
  })
  return res
}

function doRoll(data: GameData, s: GameState, now: number, auto: boolean): void {
  const p = currentPlayer(s)
  const t = s.turn
  // Chỉ lần tung tự động của người đang mất kết nối mới bị xử lý tự động; nối lại thì chơi bình thường
  t.auto = auto && !p.connected
  const face = nextInt(s, 1, data.rules.dice.faces)
  const doubled = t.doubleArmed
  t.doubleArmed = false
  const mult = data.powerups.items.find((it) => it.id === 'double')?.multiplier ?? 2
  const value = doubled ? face * mult : face
  t.roll = { face, value, doubled }
  t.rollsDone += 1
  p.stats.rolls += 1
  emit(s, 'rolled', p.id, { face, value, doubled, auto })
  const movable = movableHorses(data, s, p, face, value)
  if (movable.length === 0) {
    const inStable = p.horses.some((h) => !h.done && h.step < 0)
    t.outcome = inStable ? { kind: 'stable', left: false } : { kind: 'blocked' }
    emit(s, 'cannotMove', p.id)
    toReveal(s, p, now, 'notice')
    return
  }
  const distinctSteps = new Set(movable.map((i) => p.horses[i].step))
  if (movable.length >= 2 && distinctSteps.size > 1 && !t.auto) {
    s.phase = 'chooseHorse'
    setDeadline(s, p, 'choose', now)
    emit(s, 'chooseHorse', p.id, { horses: movable })
    return
  }
  resolveHorse(data, s, now, movable[0])
}

function resolveHorse(data: GameData, s: GameState, now: number, horse: number): void {
  const p = currentPlayer(s)
  const t = s.turn
  const geo = geometryOf(data, s)
  const h = p.horses[horse]
  const roll = t.roll!
  const target = computeTarget(data, s, geo, h.step, roll.face, roll.value)
  if (target === null) fail('INVALID_CHOICE')
  t.horse = horse
  t.from = h.step
  t.target = target

  if (h.step < 0) {
    h.step = 0
    markMoved(t)
    t.outcome = { kind: 'stable', left: true }
    emit(s, 'leftStable', p.id, { horse })
    toReveal(s, p, now, 'notice')
    return
  }

  const cell = cellAtStep(data, geo, activeColors(s), p.color, target)
  switch (cell.kind) {
    case 'finish': {
      const pillar = pick(s, data.pillars).id
      ask(data, s, now, pillar, cell.difficulty ?? 3, true)
      return
    }
    case 'question':
      ask(data, s, now, cell.pillar!, cell.difficulty ?? 1, false)
      return
    case 'gate': {
      const moved = moveTo(s, p, horse, target)
      t.outcome = { kind: 'rest', moved }
      emit(s, 'rested', p.id, { horse, from: t.from, to: target })
      toReveal(s, p, now, 'notice')
      return
    }
    case 'powerup': {
      const moved = moveTo(s, p, horse, target)
      emit(s, 'moved', p.id, { horse, from: t.from, to: target })
      gainPowerup(data, s, now, moved)
      return
    }
    case 'trap': {
      const moved = moveTo(s, p, horse, target)
      emit(s, 'moved', p.id, { horse, from: t.from, to: target })
      drawTrap(data, s, now, moved)
      return
    }
    case 'stable':
      fail('INVALID_CHOICE')
  }
}

function markMoved(t: TurnState): void {
  t.movedThisRoll = true
}

function moveTo(s: GameState, p: PlayerState, horse: number, target: number): number {
  const h = p.horses[horse]
  const moved = target - h.step
  h.step = target
  markMoved(s.turn)
  return moved
}

// ---------- Câu hỏi ----------

function ask(data: GameData, s: GameState, now: number, pillar: string, difficulty: number, isFinish: boolean): void {
  const p = currentPlayer(s)
  const q = pickQuestion(data, s, p, pillar, difficulty)
  if (!q) throw new Error('Kho câu hỏi rỗng')
  s.turn.question = {
    id: q.id,
    pillar: q.pillar,
    difficulty: q.difficulty,
    wantPillar: pillar,
    wantDifficulty: difficulty,
    isFinish,
    order: answerOrder(s, q),
    eliminated: [],
    fiftyFiftyUsed: false,
    swapUsed: false,
  }
  emit(s, 'asked', p.id, { questionId: q.id, pillar: q.pillar, difficulty: q.difficulty, isFinish })
  if (s.turn.auto) {
    // Người mất kết nối: câu hỏi tính là sai, đứng yên (mục 9)
    resolveAnswer(data, s, now, null, true)
    return
  }
  s.phase = 'question'
  setDeadline(s, p, 'answer', now)
}

function resolveAnswer(data: GameData, s: GameState, now: number, choice: number | null, timedOut: boolean): void {
  const p = currentPlayer(s)
  const t = s.turn
  const aq = t.question!
  const q = data.questionById.get(aq.id)!
  const correct = choice !== null && choice === q.correct
  let moved = 0
  let finished = false
  if (correct) {
    const geo = geometryOf(data, s)
    moved = moveTo(s, p, t.horse!, t.target!)
    p.stats.correct += 1
    if (t.target === geo.finishStep) {
      p.horses[t.horse!].done = true
      if (p.horses.every((h) => h.done)) {
        finished = true
        s.finishOrder.push(p.id)
        p.finishRank = s.finishOrder.length
      }
    }
  } else {
    p.stats.wrong += 1
    if (timedOut) p.stats.timeouts += 1
    if (!p.stats.wrongIds.includes(q.id)) p.stats.wrongIds.push(q.id)
  }
  // Đoán cùng: chỉ tính vào thống kê, không ảnh hưởng di chuyển (mục 8)
  for (const [pid, g] of Object.entries(t.guesses)) {
    const gp = playerById(s, pid)
    if (!gp) continue
    gp.stats.guessTotal += 1
    if (g === q.correct) gp.stats.guessCorrect += 1
  }
  t.outcome = { kind: 'answered', correct, timedOut, chosen: choice, correctIndex: q.correct, questionId: q.id, moved, finished }
  emit(s, correct ? 'answeredCorrect' : timedOut ? 'timedOut' : 'answeredWrong', p.id, {
    questionId: q.id,
    chosen: choice,
    correctIndex: q.correct,
    steps: moved,
    from: t.from,
    to: correct ? t.target : t.from,
    horse: t.horse,
  })
  if (finished) emit(s, 'finished', p.id, { rank: p.finishRank })
  toReveal(s, p, now, 'reveal')
}

// ---------- Power-up ----------

function gainPowerup(data: GameData, s: GameState, now: number, moved: number): void {
  const p = currentPlayer(s)
  const t = s.turn
  const item = pickWeighted(s, data.powerups.items)
  emit(s, 'powerupGained', p.id, { powerup: item.id })
  if (item.kind === 'instant') {
    p.stats.powerupsUsed += 1
    if (item.id === 'advance3') {
      // Không dây chuyền; không bao giờ đưa ngựa vào Đích (L1)
      const geo = geometryOf(data, s)
      const h = p.horses[t.horse!]
      const cap = geo.finishStep - 1
      const to = Math.min(h.step + (item.steps ?? 3), cap)
      const extra = Math.max(0, to - h.step)
      const from = h.step
      if (extra > 0) h.step = to
      t.outcome = { kind: 'powerup', moved, powerup: item.id, extra, kept: false }
      emit(s, 'advanced', p.id, { horse: t.horse, from, to: h.step, steps: extra })
    } else {
      t.extraRolls += 1
      t.outcome = { kind: 'powerup', moved, powerup: item.id, kept: false }
    }
    toReveal(s, p, now, 'notice')
    return
  }
  if (p.bag.length < data.powerups.bagSize) {
    p.bag.push(item.id)
    t.outcome = { kind: 'powerup', moved, powerup: item.id, kept: true }
    toReveal(s, p, now, 'notice')
    return
  }
  // Túi đầy: chọn bỏ món cũ hoặc bỏ món mới (mục 6)
  t.pendingPowerup = item.id
  t.outcome = { kind: 'powerup', moved, powerup: item.id, kept: false }
  if (t.auto) {
    discard(s, p, 'new')
    toReveal(s, p, now, 'notice')
    return
  }
  s.phase = 'discard'
  setDeadline(s, p, 'choose', now)
}

function discard(s: GameState, p: PlayerState, which: PowerupId | 'new'): void {
  const t = s.turn
  const incoming = t.pendingPowerup!
  if (which === 'new') {
    emit(s, 'powerupDiscarded', p.id, { powerup: incoming })
  } else {
    const idx = p.bag.indexOf(which)
    p.bag.splice(idx, 1)
    p.bag.push(incoming)
    emit(s, 'powerupDiscarded', p.id, { powerup: which })
    if (t.outcome && t.outcome.kind === 'powerup') t.outcome.kept = true
  }
  t.pendingPowerup = null
}

// ---------- Bẫy ----------

function drawTrap(data: GameData, s: GameState, now: number, moved: number): void {
  const p = currentPlayer(s)
  const t = s.turn
  const card = pickWeighted(s, data.traps.cards)
  p.stats.trapsHit += 1
  const shieldIdx = p.bag.indexOf('shield')
  if (shieldIdx >= 0) {
    // Khiên tự dùng, chặn được cả hai loại thẻ (mục 7)
    p.bag.splice(shieldIdx, 1)
    p.stats.powerupsUsed += 1
    p.stats.shieldBlocks += 1
    t.outcome = { kind: 'trap', moved, card: card.id, blocked: true }
    emit(s, 'trapDrawn', p.id, { card: card.id, blocked: true })
    emit(s, 'shieldBlocked', p.id, { card: card.id })
    toReveal(s, p, now, 'notice')
    return
  }
  if (card.kind === 'loseTurn') {
    p.skipNext = true
    t.outcome = { kind: 'trap', moved, card: card.id, blocked: false }
    emit(s, 'trapDrawn', p.id, { card: card.id, blocked: false })
  } else {
    const n = nextInt(s, card.min ?? 1, card.max ?? 3)
    const h = p.horses[t.horse!]
    const from = h.step
    // Lùi theo đường của chính người đó, không quá cổng của mình; không dây chuyền
    const to = stepBack(from, n)
    h.step = to
    const steps = from - to
    // nhãn "Bẫy — lùi {n} ô" dùng số ô lùi thực tế (mục 7)
    t.outcome = { kind: 'trap', moved, card: card.id, back: steps, drawn: n, blocked: false }
    emit(s, 'trapDrawn', p.id, { card: card.id, blocked: false, n: steps, drawn: n })
    emit(s, 'movedBack', p.id, { horse: t.horse, from, to, steps, drawn: n })
  }
  toReveal(s, p, now, 'notice')
}

function toReveal(s: GameState, p: PlayerState, now: number, kind: 'reveal' | 'notice'): void {
  s.phase = 'reveal'
  setDeadline(s, p, kind, now)
}

// ---------- Áp dụng hành động ----------

function requireCurrent(s: GameState, actor: string | undefined): PlayerState {
  const p = currentPlayer(s)
  if (!actor || !playerById(s, actor)) fail('UNKNOWN_PLAYER')
  if (actor !== p.id) fail('NOT_YOUR_TURN')
  if (p.isBot) fail('NOT_ALLOWED')
  return p
}

function requirePhase(s: GameState, ...phases: GameState['phase'][]): void {
  if (!phases.includes(s.phase)) fail('WRONG_PHASE')
}

function requireDeadline(s: GameState, now: number): void {
  if (s.deadline === null || now < s.deadline) fail('TOO_EARLY')
}

function usePowerup(data: GameData, s: GameState, p: PlayerState, id: PowerupId, now: number): void {
  const t = s.turn
  if (t.auto || !p.connected) fail('NOT_ALLOWED')
  if (!p.bag.includes(id)) fail('NO_POWERUP')
  switch (id) {
    case 'double':
      if (s.phase !== 'roll' || t.doubleArmed) fail('POWERUP_NOT_USABLE')
      t.doubleArmed = true
      break
    case 'fiftyFifty': {
      if (s.phase !== 'question' || !t.question || t.question.fiftyFiftyUsed) fail('POWERUP_NOT_USABLE')
      const q = data.questionById.get(t.question.id)!
      const remaining = q.answers.length - t.question.eliminated.length
      // Câu chỉ có 2 đáp án: không dùng được, không mất power-up (L2)
      if (remaining <= 2) fail('POWERUP_NOT_USABLE')
      const wrong = q.answers.map((_, i) => i).filter((i) => i !== q.correct && !t.question!.eliminated.includes(i))
      const drop = shuffle(s, wrong).slice(0, remaining - 2)
      t.question.eliminated.push(...drop)
      t.question.fiftyFiftyUsed = true
      break
    }
    case 'swap': {
      if (s.phase !== 'question' || !t.question || t.question.swapUsed) fail('POWERUP_NOT_USABLE')
      const cur = t.question
      const q = pickQuestion(data, s, p, cur.pillar, cur.difficulty, cur.id)
      if (!q || q.pillar !== cur.pillar || q.difficulty !== cur.difficulty) fail('NO_ALTERNATIVE')
      t.question = {
        ...cur,
        id: q.id,
        order: answerOrder(s, q),
        eliminated: [],
        fiftyFiftyUsed: cur.fiftyFiftyUsed,
        swapUsed: true,
      }
      t.guesses = {}
      setDeadline(s, p, 'answer', now)
      break
    }
    default:
      fail('POWERUP_NOT_USABLE')
  }
  p.bag.splice(p.bag.indexOf(id), 1)
  p.stats.powerupsUsed += 1
  emit(s, 'powerupUsed', p.id, { powerup: id, questionId: t.question?.id, eliminated: t.question?.eliminated })
}

function answer(data: GameData, s: GameState, now: number, choice: number): void {
  const aq = s.turn.question!
  const q = data.questionById.get(aq.id)!
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.answers.length || aq.eliminated.includes(choice)) fail('INVALID_CHOICE')
  resolveAnswer(data, s, now, choice, false)
}

/** Xử lý pha hiện tại khi hết hạn: mặc định an toàn (mục 5, 9) */
function resolveTimeout(data: GameData, s: GameState, now: number): void {
  const p = currentPlayer(s)
  switch (s.phase) {
    case 'roll':
      doRoll(data, s, now, true)
      return
    case 'chooseHorse': {
      const roll = s.turn.roll!
      const movable = movableHorses(data, s, p, roll.face, roll.value)
      resolveHorse(data, s, now, movable[0])
      return
    }
    case 'question':
      resolveAnswer(data, s, now, null, true)
      return
    case 'discard':
      discard(s, p, 'new')
      toReveal(s, p, now, 'notice')
      return
    case 'reveal':
      continueTurn(data, s, now)
      return
    case 'ended':
      fail('GAME_ENDED')
  }
}

function applyBot(data: GameData, s: GameState, now: number): void {
  const p = currentPlayer(s)
  const a = botAction(data, s, p)
  switch (a.kind) {
    case 'roll':
      doRoll(data, s, now, false)
      return
    case 'use':
      usePowerup(data, s, p, a.powerup, now)
      setDeadline(s, p, s.phase === 'question' ? 'answer' : 'roll', now)
      return
    case 'choose':
      resolveHorse(data, s, now, a.horse)
      return
    case 'answer':
      answer(data, s, now, a.choice)
      return
    case 'discard':
      discard(s, p, a.discard)
      toReveal(s, p, now, 'notice')
      return
    case 'next':
      continueTurn(data, s, now)
      return
  }
}

function dispatch(data: GameData, s: GameState, action: Action): void {
  if (s.phase === 'ended' && action.type !== 'SET_CONNECTED') fail('GAME_ENDED')
  const now = action.now
  switch (action.type) {
    case 'ROLL': {
      requirePhase(s, 'roll')
      requireCurrent(s, action.actor)
      doRoll(data, s, now, false)
      return
    }
    case 'AUTO_ROLL': {
      requirePhase(s, 'roll')
      if (currentPlayer(s).isBot) fail('NOT_ALLOWED')
      requireDeadline(s, now)
      doRoll(data, s, now, true)
      return
    }
    case 'CHOOSE_HORSE': {
      requirePhase(s, 'chooseHorse')
      const p = requireCurrent(s, action.actor)
      const roll = s.turn.roll!
      if (!movableHorses(data, s, p, roll.face, roll.value).includes(action.horse)) fail('INVALID_CHOICE')
      resolveHorse(data, s, now, action.horse)
      return
    }
    case 'ANSWER': {
      requirePhase(s, 'question')
      requireCurrent(s, action.actor)
      answer(data, s, now, action.choice)
      return
    }
    case 'GUESS': {
      requirePhase(s, 'question')
      if (!s.config.guessAlong) fail('NOT_ALLOWED')
      const gp = playerById(s, action.actor)
      if (!gp) fail('UNKNOWN_PLAYER')
      if (gp.id === currentPlayer(s).id || gp.isBot) fail('NOT_ALLOWED')
      if (s.turn.guesses[gp.id] !== undefined) fail('NOT_ALLOWED')
      const q = data.questionById.get(s.turn.question!.id)!
      if (!Number.isInteger(action.choice) || action.choice < 0 || action.choice >= q.answers.length) fail('INVALID_CHOICE')
      s.turn.guesses[gp.id] = action.choice
      emit(s, 'guessed', gp.id)
      return
    }
    case 'USE_POWERUP': {
      const p = requireCurrent(s, action.actor)
      usePowerup(data, s, p, action.powerup, now)
      return
    }
    case 'DISCARD_POWERUP': {
      requirePhase(s, 'discard')
      const p = requireCurrent(s, action.actor)
      if (action.discard !== 'new' && !p.bag.includes(action.discard)) fail('NO_POWERUP')
      discard(s, p, action.discard)
      toReveal(s, p, now, 'notice')
      return
    }
    case 'TIMEOUT': {
      if (currentPlayer(s).isBot) fail('NOT_ALLOWED')
      requireDeadline(s, now)
      resolveTimeout(data, s, now)
      return
    }
    case 'SKIP_TURN': {
      const p = currentPlayer(s)
      if (p.isBot || p.connected) fail('NOT_ALLOWED')
      requireDeadline(s, now)
      s.turn.auto = true
      resolveTimeout(data, s, now)
      return
    }
    case 'BOT_STEP': {
      if (!currentPlayer(s).isBot) fail('NOT_ALLOWED')
      requireDeadline(s, now)
      applyBot(data, s, now)
      return
    }
    case 'NEXT_TURN': {
      requirePhase(s, 'reveal')
      const p = currentPlayer(s)
      const early = action.actor === p.id && !p.isBot
      if (!early) requireDeadline(s, now)
      continueTurn(data, s, now)
      return
    }
    case 'SET_CONNECTED': {
      const p = playerById(s, action.playerId)
      if (!p) fail('UNKNOWN_PLAYER')
      if (p.connected === action.connected) return
      p.connected = action.connected
      emit(s, action.connected ? 'playerReconnected' : 'playerDisconnected', p.id)
      return
    }
    case 'END': {
      finishGame(data, s, now, 'host')
      return
    }
    default:
      fail('UNKNOWN_ACTION')
  }
}

/** Áp dụng một hành động; không bao giờ sửa state cũ */
export function applyAction(data: GameData, state: GameState, action: Action): ActionResult {
  const s = structuredClone(state)
  s.events = []
  try {
    dispatch(data, s, action)
  } catch (e) {
    if (e instanceof EngineError) return { ok: false, error: e.code }
    throw e
  }
  s.version += 1
  return { ok: true, state: s }
}

/**
 * Hành động tự động mà bất kỳ máy nào trong phòng gửi được khi đã quá hạn
 * (mục 15.4): BOT_STEP, SKIP_TURN, AUTO_ROLL, TIMEOUT. null nếu chưa tới hạn.
 */
export function pendingAutoAction(s: GameState, now: number): Action | null {
  if (s.phase === 'ended' || s.deadline === null || now < s.deadline) return null
  const p = currentPlayer(s)
  if (p.isBot) return { type: 'BOT_STEP', now }
  if (!p.connected) return { type: 'SKIP_TURN', now }
  if (s.phase === 'roll') return { type: 'AUTO_ROLL', now }
  if (s.phase === 'reveal') return { type: 'NEXT_TURN', now }
  return { type: 'TIMEOUT', now }
}

/** Số bước còn lại tới Đích của một người (tổng các ngựa) */
export function playerRemaining(data: GameData, s: GameState, p: PlayerState): number {
  const geo = geometryOf(data, s)
  return p.horses.reduce((sum, h) => sum + remainingSteps(geo, h.step, h.done), 0)
}

export type { Outcome }
