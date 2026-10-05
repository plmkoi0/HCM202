// Tiện ích cho test mạng và mô phỏng tải: dữ liệu với hạn ngắn, "người chơi tự động" dùng
// RoomConnection như giao diện thật sẽ dùng.
import type { ClientAction, StateView } from '../server/types'
import type { GameData, PowerupId } from '../src/engine/types'
import { movableHorses } from '../src/engine/reducer'
import type { RoomConnection } from '../src/net/connection'

/** Dữ liệu engine với hạn từng pha rút ngắn (chạy nhanh trong test / mô phỏng) */
export function fastData(data: GameData, scale = 0.03): GameData {
  const t = data.rules.timers
  const k = (ms: number) => Math.max(40, Math.round(ms * scale))
  return {
    ...data,
    rules: {
      ...data.rules,
      timers: Object.fromEntries(Object.entries(t).map(([name, ms]) => [name, k(ms)])) as unknown as typeof t,
    },
  }
}

export async function waitFor(cond: () => boolean, timeoutMs = 10_000, label = 'điều kiện'): Promise<void> {
  const until = Date.now() + timeoutMs
  while (!cond()) {
    if (Date.now() > until) throw new Error(`Hết giờ chờ: ${label}`)
    await new Promise((r) => setTimeout(r, 10))
  }
}

export interface AutoPlayer {
  conn: RoomConnection
  me: string
  sent: number
  errors: Record<string, number>
  /** lỗi theo "hành động:mã lỗi" */
  errorsBy: Record<string, number>
  stop(): void
}

const BENIGN = new Set(['TOO_EARLY', 'WRONG_PHASE', 'NOT_YOUR_TURN', 'GAME_ENDED', 'NOT_ALLOWED', 'INVALID_CHOICE', 'NOT_STARTED'])

/**
 * Người chơi tự động: tới lượt mình thì tung, trả lời ngẫu nhiên, chọn ngựa, bỏ món mới khi túi
 * đầy, bấm Tiếp tục; bật Đoán cùng thì đoán khi người khác trả lời. Lỗi "vô hại" do đua nhau
 * (gửi khi trạng thái vừa đổi) được đếm riêng.
 */
export function autoPlay(conn: RoomConnection, me: string, data: GameData, opts: { thinkMs?: [number, number]; answerCount?: (id: string) => number; guess?: boolean } = {}): AutoPlayer {
  const [lo, hi] = opts.thinkMs ?? [5, 40]
  const p: AutoPlayer = { conn, me, sent: 0, errors: {}, errorsBy: {}, stop: () => (stopped = true) }
  let stopped = false
  // một quyết định cho mỗi "thời điểm" của ván (lượt, lần tung, pha, câu hỏi) — trạng thái
  // đổi vì việc khác (vd. ai đó nối lại) thì không gửi lại
  let lastKey = ''
  const send = async (a: ClientAction, key: string) => {
    lastKey = key
    await new Promise((r) => setTimeout(r, lo + Math.random() * (hi - lo)))
    if (stopped) return
    p.sent += 1
    const r = await conn.act(a)
    if (!r.ok) {
      p.errors[r.error] = (p.errors[r.error] ?? 0) + 1
      const k = `${a.type}:${r.error}`
      p.errorsBy[k] = (p.errorsBy[k] ?? 0) + 1
      if (!isBenign(r.error) && lastKey === key) lastKey = ''
    }
  }
  const decide = (v: StateView): ClientAction | null => {
    const g = v.game
    if (!g || g.phase === 'ended' || v.room.status !== 'playing') return null
    const cur = g.order[g.turnIndex]
    if (cur !== me) {
      if (opts.guess && g.phase === 'question' && g.config.guessAlong && g.turn.guesses[me] === undefined) {
        const n = opts.answerCount?.(g.turn.question!.id) ?? 2
        return { type: 'GUESS', choice: Math.floor(Math.random() * n) }
      }
      return null
    }
    switch (g.phase) {
      case 'roll':
        return { type: 'ROLL' }
      case 'question': {
        const q = g.turn.question!
        const options = q.order.filter((o) => !q.eliminated.includes(o))
        return { type: 'ANSWER', choice: options[Math.floor(Math.random() * options.length)]! }
      }
      case 'chooseHorse': {
        const pl = g.players.find((x) => x.id === me)!
        const hs = movableHorses(data, g as never, pl, g.turn.roll!.face, g.turn.roll!.value)
        return { type: 'CHOOSE_HORSE', horse: hs[0] ?? 0 }
      }
      case 'discard':
        return { type: 'DISCARD_POWERUP', discard: 'new' as PowerupId | 'new' }
      case 'reveal':
        return Math.random() < 0.7 ? { type: 'NEXT_TURN' } : null
      default:
        return null
    }
  }
  const onState = (v: StateView) => {
    if (stopped) return
    const g = v.game
    if (!g) return
    const a = decide(v)
    if (!a) return
    const key = `${v.room.round}:${g.turnNumber}:${g.turn.playerId}:${g.turn.rollsDone}:${g.phase}:${g.turn.question?.id ?? ''}:${a.type}`
    if (key === lastKey) return
    void send(a, key)
  }
  const unlisten = conn.listen(onState)
  p.stop = () => {
    stopped = true
    unlisten()
  }
  if (conn.view) onState(conn.view)
  return p
}

export function isBenign(code: string): boolean {
  return BENIGN.has(code)
}
