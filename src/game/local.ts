// "Chơi trên một máy" (mục 12.7): 1–5 người thay phiên + máy chơi cùng, lưu ván trên máy,
// tải lại → "Tiếp tục ván", hoàn tác thao tác vừa rồi; thử thách cá nhân + kỷ lục (mục 9).

import { applyAction, createGame, restartDeadline, shiftTime } from '../engine/reducer'
import type { Action, ErrorCode, GameConfigInput, GameData, GameState } from '../engine/types'
import { load, remove, save } from '../lib/storage'

export interface LocalPlayerSetup {
  name: string
  color: number
  isBot: boolean
}

export interface LocalSetup {
  players: LocalPlayerSetup[]
  config: GameConfigInput
}

export interface LocalSave {
  v: 1
  savedAt: number
  setup: LocalSetup
  present: GameState
  /** state ngay trước mỗi thao tác của người (không gồm bước tự động / của máy) */
  past: GameState[]
}

export const SAVE_KEY = 'local.v1'
export const SEEN_KEY = 'local.seen.v1'
export const SETUP_KEY = 'local.setup.v1'
export const RECORDS_KEY = 'records.v1'
const PAST_LIMIT = 10

export function newLocalGame(data: GameData, setup: LocalSetup, now: number, seed: number): LocalSave {
  const present = createGame(data, {
    players: setup.players.map((p, i) => ({ id: `p${i + 1}`, name: p.name, color: p.color, isBot: p.isBot })),
    config: { ...setup.config, guessAlong: false },
    seed,
    now,
  })
  return { v: 1, savedAt: now, setup, present, past: [] }
}

export type LocalResult = { ok: true; save: LocalSave } | { ok: false; error: ErrorCode }

/**
 * Áp dụng một hành động. `human` = thao tác của người → lưu điểm hoàn tác.
 * Khi một câu hỏi vừa được chốt (đáp án đúng đã hiện), xóa lịch sử hoàn tác: không cho quay
 * lại trả lời lại câu đã lộ đáp án.
 */
export function applyLocal(data: GameData, s: LocalSave, action: Action, human: boolean, now: number): LocalResult {
  const r = applyAction(data, s.present, action)
  if (!r.ok) return r
  const revealed = r.state.events.some((e) => e.type === 'answeredCorrect' || e.type === 'answeredWrong' || e.type === 'timedOut')
  const past = revealed ? [] : human ? [...s.past, s.present].slice(-PAST_LIMIT) : s.past
  return { ok: true, save: { ...s, savedAt: now, present: r.state, past } }
}

export function canUndo(s: LocalSave): boolean {
  return s.past.length > 0
}

/** Hoàn tác về ngay trước thao tác gần nhất của người (bỏ luôn các bước tự động sau đó) */
export function undoLocal(s: LocalSave, now: number): LocalSave {
  if (s.past.length === 0) return s
  const prev = s.past[s.past.length - 1]
  return { ...s, savedAt: now, present: restartDeadline(prev, now), past: s.past.slice(0, -1) }
}

/**
 * Tiếp tục ván đã lưu: dời mọi mốc thời gian đi đúng khoảng thời gian vắng mặt (từ lần cuối
 * màn chơi còn mở — `lastSeen`), nên tải lại không được hoàn giờ, còn rời đi lâu thì giới hạn
 * ván không bị trôi.
 */
export function resumeLocal(s: LocalSave, now: number, lastSeen: number = s.savedAt): LocalSave {
  const delta = Math.max(0, now - Math.max(lastSeen, s.savedAt))
  const shift = (g: GameState) => shiftTime(g, delta)
  return { ...s, savedAt: now, present: shift(s.present), past: s.past.map(shift) }
}

/** Ván lưu còn dùng được với dữ liệu hiện tại (cấu trúc, bố cục, câu hỏi còn trong kho) */
export function isUsableSave(data: GameData, s: unknown): s is LocalSave {
  try {
    const x = s as LocalSave
    if (!x || x.v !== 1 || !x.present || x.present.schema !== 2 || !Array.isArray(x.past) || !x.setup) return false
    const all = [x.present, ...x.past]
    for (const g of all) {
      if (typeof g.config?.layout !== 'string' || !Object.hasOwn(data.board.layouts, g.config.layout) || !Array.isArray(g.players) || g.players.length === 0) return false
      if (!Array.isArray(g.order) || g.order.length !== g.players.length) return false
      if (g.turn?.question && !data.questionById.has(g.turn.question.id)) return false
      if (g.turn?.outcome?.kind === 'answered' && !data.questionById.has(g.turn.outcome.questionId)) return false
    }
    return true
  } catch {
    return false
  }
}

export function loadSave(data: GameData): LocalSave | null {
  const s = load<unknown>(SAVE_KEY, null)
  if (s === null) return null
  if (isUsableSave(data, s)) return s
  clearSave()
  return null
}

export function loadLastSeen(): number {
  return load<number>(SEEN_KEY, 0)
}

export function markSeen(now: number): void {
  save(SEEN_KEY, now)
}

export function storeSave(s: LocalSave): void {
  // ván đã kết thúc thì không giữ lại
  if (s.present.phase === 'ended') {
    clearSave()
    return
  }
  // nếu đầy bộ nhớ thì thử lưu không kèm lịch sử hoàn tác
  if (!save(SAVE_KEY, s)) save(SAVE_KEY, { ...s, past: [] })
}

export function clearSave(): void {
  remove(SAVE_KEY)
  remove(SEEN_KEY)
}

// ---------- Thử thách cá nhân và kỷ lục (mục 9, L4) ----------

/** 1 người, 0 máy */
export function isSoloChallenge(state: GameState): boolean {
  return state.players.length === 1 && !state.players[0].isBot
}

export function recordKey(state: GameState): string {
  const c = state.config
  return [c.layout, `ngua${c.horsesPerPlayer}`, c.exactFinish ? 'dungso' : '', c.startFromStable ? 'chuong' : ''].filter(Boolean).join('|')
}

export interface RecordResult {
  key: string
  previous: number | null
  turns: number | null
  isNew: boolean
}

/** Kỷ lục (ít lượt nhất) chỉ lưu khi về đích (L4). Gọi một lần khi ván kết thúc. */
export function settleRecord(state: GameState, records: Record<string, number>): { result: RecordResult; records: Record<string, number> } {
  const key = recordKey(state)
  const previous = records[key] ?? null
  const p = state.players[0]
  const finished = p.finishRank !== null
  const turns = finished ? p.stats.turns : null
  const isNew = turns !== null && (previous === null || turns < previous)
  return { result: { key, previous, turns, isNew }, records: isNew ? { ...records, [key]: turns! } : records }
}

export function loadRecords(): Record<string, number> {
  return load<Record<string, number>>(RECORDS_KEY, {})
}

export function storeRecords(r: Record<string, number>): void {
  save(RECORDS_KEY, r)
}
