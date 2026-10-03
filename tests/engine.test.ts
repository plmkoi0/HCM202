// Kiểm thử engine (mục 17 — "Engine").
import { describe, expect, it } from 'vitest'
import { branchPillar, cellAtStep, geometry, homeCellPillar, ringCellInfo, stepBack, stepToCell } from '../src/engine/board'
import { canUndo, pushHistory, startHistory, undo } from '../src/engine/history'
import { pickQuestion, resolvePool } from '../src/engine/questions'
import { applyAction, createGame, currentPlayer, pendingAutoAction, resolveConfig, restartDeadline, shiftTime } from '../src/engine/reducer'
import { buildGameData } from '../src/engine/data'
import { clientView } from '../src/engine/view'
import type { GameState, Question } from '../src/engine/types'
import { rawGameData } from '../src/lib/gameData'
import {
  act,
  answerCorrect,
  answerWrong,
  dataWithQuestions,
  gameData,
  newGame,
  next,
  q,
  rigFace,
  rollFace,
  runBots,
  searchRng,
  setBag,
  setStep,
  T0,
  tryAct,
} from './helpers'

const data = gameData
const P1 = 'p1'
const P2 = 'p2'

const step = (s: GameState, id = P1, horse = 0) => s.players.find((p) => p.id === id)!.horses[horse].step
const player = (s: GameState, id = P1) => s.players.find((p) => p.id === id)!

/** Ván 1 hoặc 2 người, người p1 (màu 0) đi trước */
function game(n = 1, config = {}, seed = 7): GameState {
  return forceFirst(newGame({ n, config, seed }))
}
/** Đặt thứ tự lượt p1, p2, … để dễ dựng tình huống (thứ tự thật trộn theo seed) */
function forceFirst(s: GameState): GameState {
  const c = structuredClone(s)
  const first = c.order[c.turnIndex]
  c.order = c.players.map((p) => p.id)
  c.turnIndex = 0
  c.turn.playerId = P1
  if (first !== P1) {
    c.players.find((p) => p.id === first)!.stats.turns -= 1
    c.players.find((p) => p.id === P1)!.stats.turns += 1
  }
  return c
}

/** Đặt ngựa p1 ở bước n ngay đầu lượt (tiến độ đầu lượt = n) */
function at(st: GameState, n: number): GameState {
  const c = setStep(st, P1, n)
  c.turn.startProgress = n
  return c
}

describe('đường đi (mục 4, D5)', () => {
  for (const layout of ['ngan', 'dai'] as const) {
    it(`bố cục ${layout}: mỗi màu đi trọn vòng chung bắt đầu từ cổng, rẽ ở ô trước cổng, rồi đường về đích, Đích`, () => {
      const geo = geometry(data, layout)
      expect(geo.finishStep).toBe(layout === 'ngan' ? 22 : 29)
      for (let c = 0; c < 6; c++) {
        const ring = Array.from({ length: geo.ringLength }, (_, s) => stepToCell(geo, c, s))
        const idx = ring.map((r) => (r.area === 'ring' ? r.index : -1))
        expect(idx[0]).toBe(c * geo.cellsPerBranch)
        expect(new Set(idx).size).toBe(geo.ringLength)
        expect(idx[geo.ringLength - 1]).toBe((c * geo.cellsPerBranch - 1 + geo.ringLength) % geo.ringLength)
        for (let k = 1; k < geo.ringLength; k++) expect(idx[k]).toBe((idx[k - 1] + 1) % geo.ringLength)
        for (let h = 0; h < geo.homeLength; h++) expect(stepToCell(geo, c, geo.ringLength + h)).toEqual({ area: 'home', color: c, index: h })
        expect(stepToCell(geo, c, geo.finishStep)).toEqual({ area: 'finish' })
        expect(stepToCell(geo, c, -1)).toEqual({ area: 'stable', color: c })
      }
    })
  }
})

describe('bàn cờ (mục 4, D1–D4)', () => {
  it('trụ cột của nhánh tính từ dữ liệu: nhánh i → trụ cột ((i − 1) mod số trụ cột) + 1', () => {
    expect([0, 1, 2, 3, 4, 5].map((b) => branchPillar(data, b))).toEqual(['dan-chu', 'phap-quyen', 'trong-sach', 'dan-chu', 'phap-quyen', 'trong-sach'])
    const two = buildGameData({ ...rawGameData, mindmap: { pillars: rawGameData.mindmap.pillars.slice(0, 2) } })
    expect([0, 1, 2, 3, 4, 5].map((b) => branchPillar(two, b))).toEqual(['dan-chu', 'phap-quyen', 'dan-chu', 'phap-quyen', 'dan-chu', 'phap-quyen'])
  })

  it('power-up ô 3 nhánh 1, 5; bẫy ô 3 nhánh 3, 6 (bố cục Ngắn)', () => {
    const geo = geometry(data, 'ngan')
    const all = new Set([0, 1, 2, 3, 4, 5])
    const kinds = Array.from({ length: 18 }, (_, i) => ringCellInfo(data, geo, all, i).kind)
    expect(kinds).toEqual([
      'gate', 'question', 'powerup',
      'gate', 'question', 'question',
      'gate', 'question', 'trap',
      'gate', 'question', 'question',
      'gate', 'question', 'powerup',
      'gate', 'question', 'trap',
    ])
  })

  it('cổng của màu trống là ô câu hỏi độ khó 1 thuộc trụ cột nhánh; cổng có người là ô nghỉ', () => {
    const geo = geometry(data, 'ngan')
    const active = new Set([0, 2])
    expect(ringCellInfo(data, geo, active, 0).kind).toBe('gate')
    expect(ringCellInfo(data, geo, active, 6).kind).toBe('gate')
    const empty = ringCellInfo(data, geo, active, 3)
    expect(empty).toMatchObject({ kind: 'question', pillar: 'phap-quyen', difficulty: 1, gateColor: 1 })
  })

  it('đường về đích: độ khó 2, 2, 3, 3 (Dài 2, 2, 3, 3, 3), trụ cột xoay vòng từ nhánh có cổng', () => {
    expect([0, 1, 2, 3].map((i) => homeCellPillar(data, 1, i))).toEqual(['phap-quyen', 'trong-sach', 'dan-chu', 'phap-quyen'])
    expect([0, 1, 2, 3].map((i) => homeCellPillar(data, 0, i))).toEqual(['dan-chu', 'phap-quyen', 'trong-sach', 'dan-chu'])
    for (const [layout, diffs] of [
      ['ngan', [2, 2, 3, 3]],
      ['dai', [2, 2, 3, 3, 3]],
    ] as const) {
      const geo = geometry(data, layout)
      const got = diffs.map((_, i) => cellAtStep(data, geo, new Set([0]), 0, geo.ringLength + i).difficulty)
      expect(got).toEqual(diffs)
    }
  })

  it('trụ cột câu về đích theo seed: cùng seed cùng trụ cột, đủ ba trụ cột trên nhiều seed', () => {
    const seen = new Set<string>()
    for (let seed = 1; seed <= 60; seed++) {
      const run = () => {
        let s = setStep(game(1, {}, seed), P1, 20)
        s = rollFace(s, 2)
        return s.turn.question!.wantPillar
      }
      expect(run()).toBe(run())
      seen.add(run())
    }
    expect(seen).toEqual(new Set(['dan-chu', 'phap-quyen', 'trong-sach']))
  })
})

describe('luật cốt lõi (mục 2, 5)', () => {
  it('ô câu hỏi: đúng → nhảy lên', () => {
    let s = rollFace(game(), 1)
    expect(s.phase).toBe('question')
    s = answerCorrect(s)
    expect(step(s)).toBe(1)
    expect(s.turn.outcome).toMatchObject({ kind: 'answered', correct: true, moved: 1 })
  })

  it('ô câu hỏi: sai → đứng yên', () => {
    let s = rollFace(game(), 1)
    s = answerWrong(s)
    expect(step(s)).toBe(0)
    expect(s.turn.outcome).toMatchObject({ kind: 'answered', correct: false, timedOut: false })
    expect(player(s).stats.wrongIds).toEqual([s.turn.question!.id])
  })

  it('ô câu hỏi: hết giờ → đứng yên; TIMEOUT trước hạn bị từ chối', () => {
    let s = rollFace(game(), 1)
    expect(tryAct(s, { type: 'TIMEOUT', now: T0 + 1000 })).toEqual({ ok: false, error: 'TOO_EARLY' })
    s = act(s, { type: 'TIMEOUT', now: s.deadline! })
    expect(step(s)).toBe(0)
    expect(s.turn.outcome).toMatchObject({ kind: 'answered', correct: false, timedOut: true })
    expect(player(s).stats.timeouts).toBe(1)
  })

  it('ô power-up: nhảy lên rồi nhận power-up', () => {
    const s = rollFace(game(), 2)
    expect(s.turn.outcome?.kind).toBe('powerup')
    expect(step(s)).toBeGreaterThanOrEqual(2)
  })

  it('ô bẫy: nhảy lên rồi rút thẻ bẫy', () => {
    const s = rollFace(setStep(game(), P1, 6), 2)
    expect(s.turn.outcome?.kind).toBe('trap')
    expect(player(s).stats.trapsHit).toBe(1)
  })

  it('cổng (có người chơi): nhảy lên, không hỏi', () => {
    const s = rollFace(game(2), 3)
    expect(s.phase).toBe('reveal')
    expect(s.turn.outcome).toEqual({ kind: 'rest', moved: 3 })
    expect(step(s)).toBe(3)
  })

  it('cổng của màu trống thành ô câu hỏi', () => {
    const s = rollFace(game(1), 3)
    expect(s.phase).toBe('question')
    expect(s.turn.question!.wantPillar).toBe('phap-quyen')
  })

  it('Đích: câu về đích độ khó 3; đúng → về đích và thắng', () => {
    let s = rollFace(setStep(game(2), P1, 20), 2)
    expect(s.turn.question).toMatchObject({ isFinish: true, wantDifficulty: 3, difficulty: 3 })
    s = answerCorrect(s)
    expect(player(s).horses[0]).toEqual({ step: 22, done: true })
    expect(player(s).finishRank).toBe(1)
    s = next(s)
    expect(s.phase).toBe('ended')
    expect(s.ended).toMatchObject({ reason: 'finish' })
    expect(s.ended!.ranking[0]).toMatchObject({ playerId: P1, rank: 1, finished: true })
  })

  it('Đích: sai → đứng yên', () => {
    let s = rollFace(setStep(game(), P1, 20), 2)
    s = answerWrong(s)
    expect(step(s)).toBe(20)
    expect(player(s).finishRank).toBeNull()
  })
})

describe('di chuyển', () => {
  it('nhiều ngựa đứng chung một ô — không có đá ngựa', () => {
    let s = setStep(game(2), P1, 2)
    s = rollFace(s, 1) // tới cổng của p2, nơi p2 đang đứng
    expect(step(s, P1)).toBe(3)
    expect(step(s, P2)).toBe(0)
    expect(s.turn.outcome?.kind).toBe('rest')
  })

  it('vượt quá Đích (mặc định): vẫn tính là tới Đích, phải trả lời câu về đích', () => {
    const s = rollFace(setStep(game(), P1, 20), 5)
    expect(s.turn.target).toBe(22)
    expect(s.turn.question!.isFinish).toBe(true)
  })

  it('tùy chọn "Phải tung đúng số": không đúng số thì đứng yên', () => {
    let s = rollFace(setStep(game(1, { exactFinish: true }), P1, 20), 5)
    expect(s.turn.outcome).toEqual({ kind: 'blocked' })
    expect(step(s)).toBe(20)
    s = rollFace(setStep(game(1, { exactFinish: true }), P1, 20), 2)
    expect(s.turn.question!.isFinish).toBe(true)
  })

  it('ra 6 đã di chuyển được thì tung thêm, tối đa một lần mỗi lượt', () => {
    let s = rollFace(game(2), 6) // ô 6: cổng màu 2 (trống) → câu hỏi
    s = answerCorrect(s)
    const turn = s.turnNumber
    s = next(s)
    expect(s.phase).toBe('roll')
    expect(currentPlayer(s).id).toBe(P1)
    expect(s.turnNumber).toBe(turn)
    expect(s.turn.sixBonusUsed).toBe(true)
    s = rollFace(s, 6) // ô 12: cổng màu 4 (trống)
    s = answerCorrect(s)
    s = next(s)
    expect(currentPlayer(s).id).toBe(P2)
  })

  it('ra 6 mà không đi được (trả lời sai) thì không tung thêm', () => {
    let s = rollFace(game(2), 6)
    s = answerWrong(s)
    s = next(s)
    expect(currentPlayer(s).id).toBe(P2)
  })

  it('hiệu ứng không dây chuyền: Tiến 3 ô tới ô câu hỏi không hỏi', () => {
    const s = searchRng(
      game(),
      (st) => act(st, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'powerup' && r.turn.outcome.powerup === 'advance3',
    )
    expect(step(s)).toBe(5)
    expect(s.phase).toBe('reveal')
    expect(s.turn.question).toBeNull()
  })

  it('hiệu ứng không dây chuyền: bẫy lùi tới ô câu hỏi không hỏi', () => {
    const s = searchRng(
      setStep(game(), P1, 6),
      (st) => act(st, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.back === 1,
    )
    expect(step(s)).toBe(7)
    expect(s.phase).toBe('reveal')
    expect(s.turn.question).toBeNull()
  })
})

/** Tung 2 từ cổng tới ô power-up và nhận đúng power-up `id` */
function gain(st: GameState, id: string, bag: GameState['players'][number]['bag'] = []) {
  return searchRng(
    setBag(st, P1, bag),
    (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
    (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'powerup' && r.turn.outcome.powerup === id,
  )
}

describe('power-up (mục 6)', () => {

  it('Tiến 3 ô: không bao giờ đưa ngựa vào Đích (dừng tối đa ở ô cuối đường về đích)', () => {
    // Bố cục thử: đường về đích 1 ô, power-up ở ô ngay trước cổng → Tiến 3 ô bị chặn ở ô về đích cuối
    const layout = {
      label: 'Thử',
      branches: Array.from({ length: 6 }, () => ['gate', 'question', 'powerup']),
      ringDifficulty: 1,
      homeDifficulties: [2],
      finishDifficulty: 3,
    }
    const d = buildGameData({ ...rawGameData, board: { ...rawGameData.board, layouts: { ...rawGameData.board.layouts, thu: layout as never } } })
    const base = forceFirst(createGame(d, { players: [{ id: P1, name: 'A', color: 0 }], config: { layout: 'thu' }, seed: 3, now: T0 }))
    const s = searchRng(
      setStep(base, P1, 15),
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }, d),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'powerup' && r.turn.outcome.powerup === 'advance3',
    )
    expect(geometry(d, 'thu').finishStep).toBe(19)
    expect(step(s)).toBe(18)
    expect(s.turn.outcome).toMatchObject({ extra: 1 })
    expect(player(s).horses[0].done).toBe(false)
  })

  it('Thêm lượt: được tung thêm một lần sau lượt này', () => {
    let s = gain(game(2), 'extraRoll')
    expect(s.turn.extraRolls).toBe(1)
    s = next(s)
    expect(s.phase).toBe('roll')
    expect(currentPlayer(s).id).toBe(P1)
    s = rollFace(s, 2) // bước 2 → 4: ô câu hỏi
    s = answerWrong(s)
    s = next(s)
    expect(currentPlayer(s).id).toBe(P2)
  })

  it('50:50: 4 → 2 đáp án, giữ đáp án đúng; câu 2 đáp án thì không dùng được và không mất power-up', () => {
    const d = dataWithQuestions([q('A', 'dan-chu', 1, 4), q('B', 'phap-quyen', 1, 2), q('C', 'trong-sach', 1, 3), q('D', 'dan-chu', 2), q('E', 'dan-chu', 3)])
    const mk = () => forceFirst(createGame(d, { players: [{ id: P1, name: 'A', color: 0 }], seed: 5, now: T0 }))
    let s = act(rigFace(setBag(mk(), P1, ['fiftyFifty']), 1), { type: 'ROLL', actor: P1, now: T0 }, d)
    expect(s.turn.question!.id).toBe('A')
    s = act(s, { type: 'USE_POWERUP', actor: P1, powerup: 'fiftyFifty', now: T0 }, d)
    expect(s.turn.question!.eliminated.length).toBe(2)
    expect(s.turn.question!.eliminated).not.toContain(0)
    expect(player(s).bag).toEqual([])
    expect(applyAction(d, s, { type: 'ANSWER', actor: P1, choice: s.turn.question!.eliminated[0], now: T0 })).toEqual({ ok: false, error: 'INVALID_CHOICE' })
    // câu 2 đáp án (bước 4: pháp quyền)
    let t = act(rigFace(setBag(mk(), P1, ['fiftyFifty']), 4), { type: 'ROLL', actor: P1, now: T0 }, d)
    expect(t.turn.question!.id).toBe('B')
    expect(applyAction(d, t, { type: 'USE_POWERUP', actor: P1, powerup: 'fiftyFifty', now: T0 })).toEqual({ ok: false, error: 'POWERUP_NOT_USABLE' })
    expect(player(t).bag).toEqual(['fiftyFifty'])
    // câu 3 đáp án (bước 7: trong sạch) → còn 2
    t = act(rigFace(setStep(setBag(mk(), P1, ['fiftyFifty']), P1, 6), 1), { type: 'ROLL', actor: P1, now: T0 }, d)
    expect(t.turn.question!.id).toBe('C')
    t = act(t, { type: 'USE_POWERUP', actor: P1, powerup: 'fiftyFifty', now: T0 }, d)
    expect(t.turn.question!.eliminated.length).toBe(1)
  })

  it('Đổi câu: sang câu khác cùng trụ cột, cùng độ khó; không còn câu khác thì không mất power-up', () => {
    const d = dataWithQuestions([q('A1', 'dan-chu', 1), q('A2', 'dan-chu', 1), q('B', 'phap-quyen', 1), q('C', 'trong-sach', 1), q('D', 'dan-chu', 2), q('E', 'dan-chu', 3)])
    const mk = () => forceFirst(createGame(d, { players: [{ id: P1, name: 'A', color: 0 }], seed: 5, now: T0 }))
    let s = act(rigFace(setBag(mk(), P1, ['swap']), 1), { type: 'ROLL', actor: P1, now: T0 }, d)
    const before = s.turn.question!.id
    s = act(s, { type: 'USE_POWERUP', actor: P1, powerup: 'swap', now: T0 + 5000 }, d)
    expect(s.turn.question!.id).not.toBe(before)
    expect(['A1', 'A2']).toContain(s.turn.question!.id)
    expect(s.deadline).toBe(T0 + 5000 + s.config.timers.answerMs)
    const t = act(rigFace(setBag(mk(), P1, ['swap']), 4), { type: 'ROLL', actor: P1, now: T0 }, d)
    expect(applyAction(d, t, { type: 'USE_POWERUP', actor: P1, powerup: 'swap', now: T0 })).toEqual({ ok: false, error: 'NO_ALTERNATIVE' })
    expect(player(t).bag).toEqual(['swap'])
  })

  it('Khiên: tự dùng khi dính bẫy, chặn cả hai loại thẻ', () => {
    for (const card of ['loseTurn', 'back']) {
      const s = searchRng(
        setBag(setStep(game(), P1, 6), P1, ['shield']),
        (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
        (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.card === card,
      )
      expect(s.turn.outcome).toMatchObject({ kind: 'trap', blocked: true, back: 0 })
      // thẻ lùi bị chặn vẫn rút số ô (để nhãn thẻ đầy đủ); thẻ mất lượt không có số
      const drawn = (s.turn.outcome as { drawn?: number }).drawn
      expect(card === 'back' ? [1, 2, 3].includes(drawn ?? 0) : drawn === undefined).toBe(true)
      expect(step(s)).toBe(8)
      expect(player(s).skipNext).toBe(false)
      expect(player(s).bag).toEqual([])
      expect(player(s).stats.shieldBlocks).toBe(1)
    }
  })

  it('Xúc xắc ×2: số chấm nhân đôi; luật ra 6 xét mặt trước khi nhân (L3)', () => {
    let s = act(setBag(game(2), P1, ['double']), { type: 'USE_POWERUP', actor: P1, powerup: 'double', now: T0 })
    expect(s.turn.doubleArmed).toBe(true)
    s = rollFace(s, 3)
    expect(s.turn.roll).toEqual({ face: 3, value: 6, doubled: true })
    expect(s.turn.target).toBe(6)
    s = answerCorrect(s)
    s = next(s)
    expect(currentPlayer(s).id).toBe(P2) // mặt 3 → không tung thêm dù tổng là 6
    // mặt 6 nhân đôi = 12 → vẫn được tung thêm
    let t = act(setBag(game(2), P1, ['double']), { type: 'USE_POWERUP', actor: P1, powerup: 'double', now: T0 })
    t = rollFace(t, 6)
    expect(t.turn.target).toBe(12)
    t = answerCorrect(t)
    t = next(t)
    expect(currentPlayer(t).id).toBe(P1)
    expect(t.phase).toBe('roll')
  })

  it('túi tối đa 2 món: túi đầy thì chọn bỏ món cũ hoặc bỏ món mới', () => {
    let s = searchRng(
      setBag(game(), P1, ['shield', 'double']),
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.phase === 'discard' && r.turn.pendingPowerup === 'swap',
    )
    expect(applyAction(data, s, { type: 'DISCARD_POWERUP', actor: P1, discard: 'fiftyFifty', now: T0 })).toEqual({ ok: false, error: 'NO_POWERUP' })
    const keepOld = act(s, { type: 'DISCARD_POWERUP', actor: P1, discard: 'new', now: T0 })
    expect(player(keepOld).bag).toEqual(['shield', 'double'])
    s = act(s, { type: 'DISCARD_POWERUP', actor: P1, discard: 'double', now: T0 })
    expect(player(s).bag).toEqual(['shield', 'swap'])
    expect(s.phase).toBe('reveal')
  })

  it('không dùng power-up không có trong túi', () => {
    expect(tryAct(game(), { type: 'USE_POWERUP', actor: P1, powerup: 'double', now: T0 })).toEqual({ ok: false, error: 'NO_POWERUP' })
    const s = setBag(game(), P1, ['shield'])
    expect(tryAct(s, { type: 'USE_POWERUP', actor: P1, powerup: 'shield', now: T0 })).toEqual({ ok: false, error: 'POWERUP_NOT_USABLE' })
  })
})

describe('bẫy (mục 7)', () => {
  // Rút nhiều thẻ bẫy: p1 ở bước 6, tung 2 → ô bẫy
  const draws = (() => {
    const base = setStep(game(), P1, 6)
    const out: { card: string; back?: number }[] = []
    for (let r = 1; out.length < 3000; r++) {
      const c = structuredClone(base)
      c.rng = r
      const s = act(c, { type: 'ROLL', actor: P1, now: T0 })
      if (s.turn.roll!.face !== 2) continue
      const o = s.turn.outcome as { kind: 'trap'; card: string; back?: number }
      out.push({ card: o.card, back: o.back })
    }
    return out
  })()

  it('chỉ ra hai loại thẻ theo tỉ lệ cấu hình (50/50)', () => {
    expect(new Set(draws.map((d) => d.card))).toEqual(new Set(['loseTurn', 'back']))
    const lose = draws.filter((d) => d.card === 'loseTurn').length / draws.length
    expect(lose).toBeGreaterThan(0.45)
    expect(lose).toBeLessThan(0.55)
  })

  it('lùi ngẫu nhiên chỉ ra 1, 2 hoặc 3 ô, phân bố đều', () => {
    const backs = draws.filter((d) => d.card === 'back').map((d) => d.back!)
    expect(new Set(backs)).toEqual(new Set([1, 2, 3]))
    for (const n of [1, 2, 3]) {
      const share = backs.filter((b) => b === n).length / backs.length
      expect(share).toBeGreaterThan(0.28)
      expect(share).toBeLessThan(0.39)
    }
  })

  it('mất lượt bỏ đúng một lượt', () => {
    let s = searchRng(
      setStep(game(2), P1, 6),
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.card === 'loseTurn',
    )
    expect(player(s).skipNext).toBe(true)
    s = next(s) // → p2
    expect(currentPlayer(s).id).toBe(P2)
    s = rollFace(s, 1)
    s = answerWrong(s)
    s = next(s) // p1 bị bỏ lượt → lại p2
    expect(currentPlayer(s).id).toBe(P2)
    expect(s.events.some((e) => e.type === 'turnSkipped' && e.playerId === P1)).toBe(true)
    expect(player(s).skipNext).toBe(false)
    s = rollFace(s, 1)
    s = answerWrong(s)
    s = next(s)
    expect(currentPlayer(s).id).toBe(P1)
  })

  it('không lùi quá cổng của chính người đó', () => {
    // màu 2 (cổng ô 6): ô bẫy ở vòng ô 8 = bước 2
    const base = forceFirst(createGame(data, { players: [{ id: P1, name: 'A', color: 2 }], seed: 9, now: T0 }))
    const s = searchRng(
      base,
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.drawn === 3,
    )
    expect(step(s)).toBe(0)
    // nhãn "Bẫy — lùi {n} ô" dùng số ô lùi thực tế: rút 3 nhưng chỉ lùi được 2
    expect(s.turn.outcome).toMatchObject({ back: 2, drawn: 3 })
    expect(s.events.find((e) => e.type === 'trapDrawn')!.data).toMatchObject({ n: 2, drawn: 3 })
    expect(s.events.find((e) => e.type === 'movedBack')!.data).toMatchObject({ from: 2, to: 0, steps: 2 })
  })

  it('lùi theo đường của người đó: được từ đường về đích ra vòng chung, không quá cổng', () => {
    // bước 19 (ô về đích thứ 2) lùi 3 → bước 16 trên vòng chung
    expect(stepBack(19, 3)).toBe(16)
    expect(stepToCell(geometry(data, 'ngan'), 0, stepBack(19, 3))).toEqual({ area: 'ring', index: 16 })
    expect(stepBack(2, 3)).toBe(0)
  })
})

describe('tùy chọn luật', () => {
  it('ra chuồng khi tung 1 hoặc 6', () => {
    let s = game(2, { startFromStable: true })
    expect(step(s)).toBe(-1)
    const stay = rollFace(s, 3)
    expect(stay.turn.outcome).toEqual({ kind: 'stable', left: false })
    expect(step(stay)).toBe(-1)
    s = rollFace(s, 1)
    expect(s.turn.outcome).toEqual({ kind: 'stable', left: true })
    expect(step(s)).toBe(0)
    s = next(s)
    expect(currentPlayer(s).id).toBe(P2)
    let t = rollFace(game(2, { startFromStable: true }), 6)
    expect(step(t)).toBe(0)
    t = next(t)
    expect(currentPlayer(t).id).toBe(P1) // ra 6 và đã di chuyển (ra chuồng) → tung thêm
  })

  it('2 ngựa: tung xong chọn ngựa để đi; thắng khi cả hai về đích', () => {
    let s = setStep(game(1, { horsesPerPlayer: 2 }), P1, 5, 1)
    expect(player(s).horses.length).toBe(2)
    s = rollFace(s, 1)
    expect(s.phase).toBe('chooseHorse')
    expect(tryAct(s, { type: 'CHOOSE_HORSE', actor: P1, horse: 5, now: T0 })).toEqual({ ok: false, error: 'INVALID_CHOICE' })
    s = act(s, { type: 'CHOOSE_HORSE', actor: P1, horse: 1, now: T0 })
    expect(s.turn.horse).toBe(1)
    // một ngựa về đích chưa thắng
    let w = structuredClone(game(1, { horsesPerPlayer: 2 }))
    w.players[0].horses = [{ step: 22, done: true }, { step: 20, done: false }]
    w = rollFace(w, 2)
    expect(w.turn.question!.isFinish).toBe(true)
    w = answerCorrect(w)
    expect(player(w).finishRank).toBe(1)
    let one = structuredClone(game(1, { horsesPerPlayer: 2 }))
    one.players[0].horses = [{ step: 20, done: false }, { step: 3, done: false }]
    one = rollFace(one, 2)
    one = act(one, { type: 'CHOOSE_HORSE', actor: P1, horse: 0, now: T0 })
    one = answerCorrect(one)
    expect(player(one).horses[0].done).toBe(true)
    expect(player(one).finishRank).toBeNull()
  })

  it('Đoán cùng: mặc định tắt; khi bật không ảnh hưởng di chuyển, chỉ tính thống kê', () => {
    expect(resolveConfig(data).guessAlong).toBe(false)
    const off = rollFace(game(2), 1)
    expect(tryAct(off, { type: 'GUESS', actor: P2, choice: 0, now: T0 })).toEqual({ ok: false, error: 'NOT_ALLOWED' })
    let s = rollFace(game(2, { guessAlong: true }), 1)
    const correct = data.questionById.get(s.turn.question!.id)!.correct
    expect(tryAct(s, { type: 'GUESS', actor: P1, choice: 0, now: T0 })).toEqual({ ok: false, error: 'NOT_ALLOWED' })
    s = act(s, { type: 'GUESS', actor: P2, choice: correct, now: T0 })
    expect(tryAct(s, { type: 'GUESS', actor: P2, choice: correct, now: T0 })).toEqual({ ok: false, error: 'NOT_ALLOWED' })
    s = answerWrong(s)
    expect(step(s, P1)).toBe(0)
    expect(step(s, P2)).toBe(0)
    expect(player(s, P2).stats).toMatchObject({ guessTotal: 1, guessCorrect: 1 })
  })
})

describe('kết thúc (mục 10)', () => {
  it('chơi tiếp để xếp hạng 2, 3…; còn một người chưa về đích thì người đó xếp cuối, ván kết thúc', () => {
    let s = rollFace(setStep(game(3, { afterFirstFinish: 'continue' }), P1, 20), 2)
    s = answerCorrect(s)
    s = next(s)
    expect(s.phase).toBe('roll')
    expect(currentPlayer(s).id).toBe(P2)
    s = setStep(s, P2, 21)
    s = rollFace(s, 1)
    s = answerCorrect(s)
    s = next(s)
    expect(s.ended).toMatchObject({ reason: 'allFinished' })
    expect(s.ended!.ranking.map((r) => [r.playerId, r.rank])).toEqual([
      [P1, 1],
      [P2, 2],
      ['p3', 3],
    ])
    // 2 người: người đầu về đích là đủ thứ hạng, ván kết thúc
    let two = rollFace(setStep(game(2, { afterFirstFinish: 'continue' }), P1, 20), 2)
    two = next(answerCorrect(two))
    expect(two.ended).toMatchObject({ reason: 'allFinished' })
  })

  it('các mốc 5 / 7 / 10 / 15 phút / không giới hạn; mặc định 10 phút', () => {
    expect(game().endsAt).toBe(T0 + 10 * 60_000)
    for (const m of [5, 7, 10, 15]) expect(game(1, { timeLimitMin: m }).endsAt).toBe(T0 + m * 60_000)
    expect(game(1, { timeLimitMin: null }).endsAt).toBeNull()
    expect(() => game(1, { timeLimitMin: 8 })).toThrow(/Giới hạn thời gian/)
  })

  it('hết giờ: chơi nốt lượt đang dở rồi xếp theo khoảng cách; hòa so số câu đúng', () => {
    let s = structuredClone(game(3, { timeLimitMin: 5 }))
    s.players[1].horses[0].step = 10
    s.players[2].horses[0].step = 10
    s.players[2].stats.correct = 4
    s.players[1].stats.correct = 2
    const late = T0 + 5 * 60_000 + 1
    s = act(rigFace(s, 1), { type: 'ROLL', actor: P1, now: late })
    expect(s.phase).toBe('question') // lượt đang dở vẫn chơi tiếp
    s = answerWrong(s, data, late)
    s = act(s, { type: 'NEXT_TURN', actor: P1, now: late })
    expect(s.ended).toMatchObject({ reason: 'time' })
    expect(s.ended!.ranking.map((r) => [r.playerId, r.rank, r.remaining])).toEqual([
      ['p3', 1, 12],
      ['p2', 2, 12],
      [P1, 3, 22],
    ])
  })

  it('bằng cả khoảng cách lẫn số câu đúng thì cùng hạng', () => {
    let s = game(2, { timeLimitMin: 5 })
    const late = T0 + 5 * 60_000
    s = act(rigFace(s, 1), { type: 'ROLL', actor: P1, now: late })
    s = act(s, { type: 'TIMEOUT', now: s.deadline! })
    s = act(s, { type: 'NEXT_TURN', actor: P1, now: s.deadline! })
    expect(s.ended!.ranking.map((r) => r.rank)).toEqual([1, 1])
  })

  it('không nhận hành động sau khi kết thúc', () => {
    let s = act(game(), { type: 'END', now: T0 })
    expect(s.ended).toMatchObject({ reason: 'host' })
    expect(tryAct(s, { type: 'ROLL', actor: P1, now: T0 })).toEqual({ ok: false, error: 'GAME_ENDED' })
    s = act(s, { type: 'SET_CONNECTED', playerId: P1, connected: false, now: T0 })
    expect(player(s).connected).toBe(false)
  })
})

describe('câu hỏi (mục 8)', () => {
  it('không lặp cho tới khi dùng hết kho; sau đó trộn lại vòng mới, câu vừa hỏi không ra ngay', () => {
    const d = dataWithQuestions([q('A', 'dan-chu', 1), q('B', 'dan-chu', 1), q('C', 'dan-chu', 1)])
    for (let seed = 1; seed <= 50; seed++) {
      const ctx = { rng: seed, usedQuestions: [] as string[] }
      const me = structuredClone(player(game()))
      const picks = Array.from({ length: 9 }, () => pickQuestion(d, ctx, me, 'dan-chu', 1)!.id)
      expect(new Set(picks.slice(0, 3)).size, `seed ${seed}`).toBe(3)
      for (let i = 1; i < picks.length; i++) expect(picks[i], `seed ${seed}: ${picks.join(' ')}`).not.toBe(picks[i - 1])
      // vòng sau khi trộn lại vẫn không lặp trong vòng (vòng 2 có 2 câu vì câu cuối vòng 1 đứng ngoài)
      expect(new Set(picks.slice(3, 5)).size, `seed ${seed}`).toBe(2)
    }
    // kho 2 câu: luân phiên, không bao giờ lặp liền
    const d2 = dataWithQuestions([q('A', 'dan-chu', 1), q('B', 'dan-chu', 1)])
    const ctx2 = { rng: 3, usedQuestions: [] as string[] }
    const me2 = structuredClone(player(game()))
    const seq = Array.from({ length: 8 }, () => pickQuestion(d2, ctx2, me2, 'dan-chu', 1)!.id).join('')
    expect(['ABABABAB', 'BABABABA']).toContain(seq)
  })

  it('trong vòng, ưu tiên câu người đó chưa gặp', () => {
    const d = dataWithQuestions([q('A', 'dan-chu', 1), q('B', 'dan-chu', 1), q('C', 'dan-chu', 1)])
    const other = structuredClone(player(game()))
    other.seen = ['A', 'B']
    for (let seed = 1; seed <= 20; seed++) {
      const ctx = { rng: seed, usedQuestions: [] as string[] }
      expect(pickQuestion(d, ctx, structuredClone(other), 'dan-chu', 1)!.id).toBe('C')
    }
  })

  it('tổ hợp không có câu: lấy cùng trụ cột ở độ khó gần nhất, rồi trụ cột khác cùng độ khó', () => {
    const d = dataWithQuestions([q('D3', 'dan-chu', 3), q('D1', 'dan-chu', 1), q('P2', 'phap-quyen', 2)])
    expect(resolvePool(d, 'dan-chu', 2).map((x) => x.id)).toEqual(['D1']) // cách đều → lấy độ khó thấp hơn
    expect(resolvePool(d, 'dan-chu', 3).map((x) => x.id)).toEqual(['D3'])
    expect(resolvePool(d, 'trong-sach', 2).map((x) => x.id)).toEqual(['P2'])
    expect(resolvePool(d, 'trong-sach', 1).map((x) => x.id)).toEqual(['D1'])
  })

  it('đáp án trộn khi hiện; state không chứa đáp án đúng trước khi chốt', () => {
    const orders = new Set<string>()
    for (let seed = 1; seed < 40; seed++) {
      const s = rollFace(game(1, {}, seed), 1)
      orders.add(s.turn.question!.order.join(''))
      expect(s.turn.outcome).toBeNull()
      expect(JSON.stringify(s.turn.question)).not.toMatch(/correct/i)
      expect(Object.keys(clientView(s))).not.toContain('rng')
    }
    expect(orders.size).toBeGreaterThan(5)
  })
})

describe('tự động', () => {
  it('tự tung khi quá hạn (15 s); trước hạn bị từ chối', () => {
    const s = game()
    expect(s.deadline).toBe(T0 + 15_000)
    expect(tryAct(s, { type: 'AUTO_ROLL', now: T0 + 14_999 })).toEqual({ ok: false, error: 'TOO_EARLY' })
    const t = act(s, { type: 'AUTO_ROLL', now: T0 + 15_000 })
    expect(t.turn.roll).not.toBeNull()
    expect(t.events.find((e) => e.type === 'rolled')!.data).toMatchObject({ auto: true })
  })

  it('mất kết nối: sau 20 s tự tung, câu hỏi tính là sai, không dùng power-up; quay lại chơi tiếp ở vị trí cũ', () => {
    let s = act(game(2), { type: 'SET_CONNECTED', playerId: P2, connected: false, now: T0 })
    s = setBag(s, P2, ['double'])
    s = rollFace(s, 1)
    s = answerWrong(s)
    s = next(s, T0 + 100)
    expect(currentPlayer(s).id).toBe(P2)
    expect(s.deadline).toBe(T0 + 100 + 20_000)
    expect(pendingAutoAction(s, T0 + 100)).toBeNull()
    expect(pendingAutoAction(s, s.deadline!)).toEqual({ type: 'SKIP_TURN', now: s.deadline! })
    expect(tryAct(s, { type: 'SKIP_TURN', now: T0 + 1000 })).toEqual({ ok: false, error: 'TOO_EARLY' })
    s = rigFace(s, 1)
    s = act(s, { type: 'SKIP_TURN', now: s.deadline! })
    expect(s.turn.outcome).toMatchObject({ kind: 'answered', correct: false })
    expect(step(s, P2)).toBe(0)
    expect(player(s, P2).bag).toEqual(['double'])
    s = act(s, { type: 'SET_CONNECTED', playerId: P2, connected: true, now: T0 + 30_000 })
    expect(player(s, P2).connected).toBe(true)
  })

  it('nối lại giữa lượt (đang có lần tung thêm) thì chơi bình thường: có câu hỏi 20 s, dùng được power-up', () => {
    // lần tung tự động (đang mất kết nối) tới ô power-up và nhận Thêm lượt
    let t = act(setBag(game(2), P1, ['double']), { type: 'SET_CONNECTED', playerId: P1, connected: false, now: T0 })
    t = searchRng(
      t,
      (x) => act(x, { type: 'SKIP_TURN', now: x.deadline! }),
      (res) => res.turn.roll?.face === 2 && res.turn.outcome?.kind === 'powerup' && res.turn.outcome.powerup === 'extraRoll',
    )
    expect(t.turn.auto).toBe(true)
    t = act(t, { type: 'SET_CONNECTED', playerId: P1, connected: true, now: T0 + 5000 })
    t = act(t, { type: 'NEXT_TURN', actor: P1, now: T0 + 6000 })
    expect(t.phase).toBe('roll')
    expect(currentPlayer(t).id).toBe(P1)
    expect(t.turn.auto).toBe(false)
    t = act(t, { type: 'USE_POWERUP', actor: P1, powerup: 'double', now: T0 + 6000 })
    t = act(rigFace(t, 1), { type: 'ROLL', actor: P1, now: T0 + 7000 }) // bước 2 + 1×2 = 4: câu hỏi
    expect(t.phase).toBe('question')
    expect(t.deadline).toBe(T0 + 7000 + 20_000)
  })

  it('người đang mất kết nối không dùng được power-up', () => {
    const s = act(setBag(game(2), P1, ['double']), { type: 'SET_CONNECTED', playerId: P1, connected: false, now: T0 })
    expect(tryAct(s, { type: 'USE_POWERUP', actor: P1, powerup: 'double', now: T0 })).toEqual({ ok: false, error: 'NOT_ALLOWED' })
  })

  it('thử thách cá nhân: lượt bị bỏ (thẻ mất lượt) vẫn tính vào số lượt', () => {
    let s = searchRng(
      setStep(game(), P1, 6),
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.card === 'loseTurn',
    )
    expect(player(s).stats.turns).toBe(1)
    s = next(s)
    expect(s.events.some((e) => e.type === 'turnSkipped' && e.playerId === P1)).toBe(true)
    expect(currentPlayer(s).id).toBe(P1)
    expect(s.phase).toBe('roll')
    expect(player(s).stats.turns).toBe(3)
  })

  it('thử thách cá nhân: đếm số lượt', () => {
    let s = game()
    s = rollFace(s, 1) // bước 1: câu hỏi
    s = answerCorrect(s)
    s = next(s)
    s = rollFace(s, 2) // bước 3: cổng màu trống → câu hỏi
    s = answerCorrect(s)
    s = next(s)
    expect(player(s).stats.turns).toBe(3)
    expect(step(s)).toBe(3)
  })

  it('bot: chỉ nhận BOT_STEP khi tới hạn; người không gửi được BOT_STEP, bot không bị TIMEOUT', () => {
    const s = forceFirst(newGame({ n: 2, bots: [0] }))
    expect(tryAct(s, { type: 'ROLL', actor: P1, now: T0 })).toEqual({ ok: false, error: 'NOT_ALLOWED' })
    expect(tryAct(s, { type: 'TIMEOUT', now: s.deadline! })).toEqual({ ok: false, error: 'NOT_ALLOWED' })
    expect(tryAct(s, { type: 'BOT_STEP', now: T0 })).toEqual({ ok: false, error: 'TOO_EARLY' })
    expect(s.deadline).toBe(T0 + 1500)
    const t = act(s, { type: 'BOT_STEP', now: s.deadline! })
    expect(t.turn.roll).not.toBeNull()
  })

  it('sai lượt bị từ chối', () => {
    expect(tryAct(game(2), { type: 'ROLL', actor: P2, now: T0 })).toEqual({ ok: false, error: 'NOT_YOUR_TURN' })
    expect(tryAct(game(2), { type: 'ROLL', actor: 'x', now: T0 })).toEqual({ ok: false, error: 'UNKNOWN_PLAYER' })
    expect(tryAct(game(2), { type: 'ANSWER', actor: P1, choice: 0, now: T0 })).toEqual({ ok: false, error: 'WRONG_PHASE' })
  })
})

describe('khác', () => {
  it('hoàn tác (chơi trên một máy) khôi phục đúng state trước, kể cả RNG', () => {
    const s0 = game()
    let h = startHistory(s0)
    expect(canUndo(h)).toBe(false)
    const s1 = act(s0, { type: 'ROLL', actor: P1, now: T0 })
    h = pushHistory(h, s1)
    expect(canUndo(h)).toBe(true)
    h = undo(h)
    expect(h.present).toEqual(s0)
    expect(act(h.present, { type: 'ROLL', actor: P1, now: T0 })).toEqual(s1)
  })

  it('cùng seed → cùng kết quả (cả thẻ bẫy và bot); thứ tự lượt trộn theo seed', () => {
    const a = runBots(newGame({ n: 5, bots: [0, 1, 2, 3, 4], seed: 123, config: { timeLimitMin: null } }))
    const b = runBots(newGame({ n: 5, bots: [0, 1, 2, 3, 4], seed: 123, config: { timeLimitMin: null } }))
    expect(a).toEqual(b)
    expect(a.ended).not.toBeNull()
    const orders = new Set(Array.from({ length: 20 }, (_, i) => newGame({ n: 5, seed: i + 1 }).order.join()))
    expect(orders.size).toBeGreaterThan(5)
  })

  it('ván toàn bot luôn kết thúc, mọi hành động hợp lệ', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const s = runBots(newGame({ n: 3, bots: [0, 1, 2], seed, config: { timeLimitMin: null, horsesPerPlayer: seed % 2 ? 1 : 2, startFromStable: seed % 3 === 0 } }))
      expect(s.ended, `seed ${seed}`).not.toBeNull()
      expect(s.ended!.ranking[0].finished).toBe(true)
    }
  })

  it('chuỗi đứng yên: lượt dính bẫy lùi về chỗ cũ hoặc sau chỗ cũ vẫn tính là đứng yên', () => {
    // bước 7, tung 1 → bẫy ở bước 8, lùi 1 → về lại bước 7
    let s = searchRng(
      at(game(), 7),
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 1 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.back === 1,
    )
    expect(step(s)).toBe(7)
    s = next(s)
    expect(player(s).stats).toMatchObject({ stall: 1, maxStall: 1 })
    // bước 6, tung 2 → bẫy, lùi 3 → bước 5 (sau chỗ xuất phát)
    let t = searchRng(
      at(game(), 6),
      (x) => act(x, { type: 'ROLL', actor: P1, now: T0 }),
      (r) => r.turn.roll?.face === 2 && r.turn.outcome?.kind === 'trap' && r.turn.outcome.back === 3,
    )
    expect(step(t)).toBe(5)
    t = next(t)
    expect(player(t).stats.stall).toBe(1)
    t = rollFace(t, 2) // bước 7: câu hỏi
    t = answerCorrect(t)
    t = next(t)
    expect(player(t).stats).toMatchObject({ stall: 0, maxStall: 1 })
  })

  it('bot không dùng Đổi câu sau khi 50:50 đã loại đáp án', () => {
    let s = forceFirst(newGame({ n: 1, bots: [0] }))
    s = setBag(setStep(s, P1, 20), P1, ['fiftyFifty', 'swap'])
    s = rigFace(s, 1) // bước 21: độ khó 3
    s = act(s, { type: 'BOT_STEP', now: s.deadline! })
    expect(s.phase).toBe('question')
    s = act(s, { type: 'BOT_STEP', now: s.deadline! })
    expect(s.turn.question!.fiftyFiftyUsed).toBe(true)
    s = act(s, { type: 'BOT_STEP', now: s.deadline! })
    expect(s.phase).toBe('reveal')
    expect(player(s).bag).toEqual(['swap'])
  })

  it('clientView: người đang trả lời không thấy lựa chọn Đoán cùng của người khác', () => {
    let s = rollFace(game(3, { guessAlong: true }), 1)
    s = act(s, { type: 'GUESS', actor: P2, choice: 1, now: T0 })
    s = act(s, { type: 'GUESS', actor: 'p3', choice: 2, now: T0 })
    expect(clientView(s, P1).turn.guesses).toEqual({})
    expect(clientView(s, P2).turn.guesses).toEqual({ [P2]: 1 })
    expect(clientView(s).turn.guesses).toEqual({})
    expect(s.turn.guesses).toEqual({ [P2]: 1, p3: 2 })
  })

  it('lượt của máy: người ngồi cùng bấm Tiếp tục được trước hạn; máy và người lạ thì không', () => {
    let s = forceFirst(newGame({ n: 2, bots: [0] }))
    s = act(s, { type: 'BOT_STEP', now: s.deadline! })
    while (s.phase !== 'reveal') s = act(s, { type: 'BOT_STEP', now: s.deadline! })
    expect(tryAct(s, { type: 'NEXT_TURN', actor: P1, now: T0 })).toEqual({ ok: false, error: 'TOO_EARLY' })
    expect(tryAct(s, { type: 'NEXT_TURN', actor: 'x', now: T0 })).toEqual({ ok: false, error: 'TOO_EARLY' })
    expect(tryAct(s, { type: 'NEXT_TURN', actor: P2, now: T0 }).ok).toBe(true)
  })

  it('restartDeadline / shiftTime: đặt lại hạn theo pha, dời mốc thời gian', () => {
    const s = rollFace(game(), 1)
    const r = restartDeadline(s, T0 + 50_000)
    expect(r.deadline).toBe(T0 + 50_000 + 20_000)
    const sh = shiftTime(s, 1000)
    expect([sh.startedAt, sh.endsAt, sh.deadline]).toEqual([s.startedAt + 1000, s.endsAt! + 1000, s.deadline! + 1000])
  })

  it('tạo ván: 1–5 người, không trùng màu', () => {
    expect(() => newGame({ n: 6 })).toThrow(/Số người chơi/)
    expect(() => newGame({ n: 2, colors: [1, 1] })).toThrow(/Trùng màu/)
    expect(newGame({ n: 5 }).players.length).toBe(5)
  })
})

describe('dữ liệu mượn câu hỏi', () => {
  it('kho thật: mọi ô của bàn cờ đều tìm được câu đúng trụ cột và độ khó (không phải mượn)', () => {
    for (const p of data.pillars) {
      for (const d of [1, 2, 3]) {
        const pool = resolvePool(data, p.id, d) as Question[]
        expect(pool.every((x) => x.pillar === p.id && x.difficulty === d), `${p.id}/${d}`).toBe(true)
      }
    }
  })
})
