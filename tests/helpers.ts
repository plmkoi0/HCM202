import { applyAction, createGame, currentPlayer, pendingAutoAction } from '../src/engine/reducer'
import { buildGameData } from '../src/engine/data'
import { nextInt } from '../src/engine/rng'
import { rawGameData, gameData } from '../src/lib/gameData'
import type { Action, GameConfigInput, GameData, GameState, PlayerSetup, Question } from '../src/engine/types'

export { gameData }

export const T0 = 1_000_000

export function players(n: number, opts: { bots?: number[]; colors?: number[] } = {}): PlayerSetup[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Người ${i + 1}`,
    color: opts.colors?.[i] ?? i,
    isBot: opts.bots?.includes(i) ?? false,
  }))
}

export function newGame(
  opts: { n?: number; bots?: number[]; colors?: number[]; config?: GameConfigInput; seed?: number; data?: GameData } = {},
): GameState {
  return createGame(opts.data ?? gameData, {
    players: players(opts.n ?? 1, { bots: opts.bots, colors: opts.colors }),
    config: opts.config,
    seed: opts.seed ?? 42,
    now: T0,
  })
}

/** Áp dụng hành động, ném lỗi nếu engine từ chối */
export function act(s: GameState, a: Action, data: GameData = gameData): GameState {
  const r = applyAction(data, s, a)
  if (!r.ok) throw new Error(`Hành động ${a.type} bị từ chối: ${r.error}`)
  return r.state
}

export function tryAct(s: GameState, a: Action, data: GameData = gameData) {
  return applyAction(data, s, a)
}

/** Đặt RNG sao cho lần rút số nguyên kế tiếp trong [1, faces] ra `face` */
export function rigFace(s: GameState, face: number, faces = 6): GameState {
  // tìm từ RNG hiện tại để các seed khác nhau vẫn cho các lần rút sau khác nhau
  const c = structuredClone(s)
  for (let k = 0; k < 100000; k++) {
    const r = (s.rng + k * 7919) >>> 0
    const h = { rng: r }
    if (nextInt(h, 1, faces) === face) {
      c.rng = r
      return c
    }
  }
  throw new Error('không tìm được rng')
}

/**
 * Thử lần lượt nhiều giá trị RNG cho tới khi `run(state)` cho kết quả thỏa `ok`.
 * Dùng để dựng tình huống cần xúc xắc / thẻ bẫy / power-up cụ thể.
 */
export function searchRng<T>(s: GameState, run: (s: GameState) => T, ok: (r: T) => boolean, tries = 20000): T {
  for (let r = 1; r < tries; r++) {
    const c = structuredClone(s)
    c.rng = r
    let res: T
    try {
      res = run(c)
    } catch {
      continue
    }
    if (ok(res)) return res
  }
  throw new Error('searchRng: không tìm được tình huống')
}

/** Tung với mặt xúc xắc cho trước (người đến lượt) */
export function rollFace(s: GameState, face: number, now = T0): GameState {
  const p = currentPlayer(s)
  return act(rigFace(s, face), { type: 'ROLL', actor: p.id, now })
}

export function answerCorrect(s: GameState, data: GameData = gameData, now = T0): GameState {
  const cur = data.questionById.get(s.turn.question!.id)!
  return act(s, { type: 'ANSWER', actor: currentPlayer(s).id, choice: cur.correct, now }, data)
}

export function answerWrong(s: GameState, data: GameData = gameData, now = T0): GameState {
  const cur = data.questionById.get(s.turn.question!.id)!
  const wrong = cur.answers.findIndex((_, i) => i !== cur.correct && !s.turn.question!.eliminated.includes(i))
  return act(s, { type: 'ANSWER', actor: currentPlayer(s).id, choice: wrong, now }, data)
}

export function next(s: GameState, now = T0): GameState {
  return act(s, { type: 'NEXT_TURN', actor: currentPlayer(s).id, now })
}

export function setStep(s: GameState, playerId: string, step: number, horse = 0): GameState {
  const c = structuredClone(s)
  c.players.find((p) => p.id === playerId)!.horses[horse].step = step
  return c
}

export function setBag(s: GameState, playerId: string, bag: GameState['players'][number]['bag']): GameState {
  const c = structuredClone(s)
  c.players.find((p) => p.id === playerId)!.bag = bag
  return c
}

/** Chạy hành động tự động tới khi ván kết thúc (mọi người là bot) */
export function runBots(s: GameState, data: GameData = gameData, maxSteps = 20000): GameState {
  let st = s
  let now = T0
  for (let i = 0; i < maxSteps && st.phase !== 'ended'; i++) {
    now = Math.max(now, st.deadline ?? now)
    const a = pendingAutoAction(st, now)
    if (!a) throw new Error('không có hành động tự động')
    st = act(st, a, data)
  }
  return st
}

/** Dữ liệu engine với kho câu hỏi tùy chọn (để thử quy tắc chọn câu) */
export function dataWithQuestions(questions: Question[]): GameData {
  return buildGameData({ ...rawGameData, questions })
}

export function q(id: string, pillar: string, difficulty: 1 | 2 | 3, answers = 4): Question {
  return {
    id,
    pillar,
    type: answers === 2 ? 'truefalse' : 'single',
    difficulty,
    question: `Câu ${id}`,
    answers: answers === 2 ? ['Đúng', 'Sai'] : Array.from({ length: answers }, (_, i) => `Đáp án ${i + 1}`),
    correct: 0,
    explanation: 'Giải thích',
    source: { ref: 'Câu hỏi thử' },
    verified: false,
    test: true,
  }
}
