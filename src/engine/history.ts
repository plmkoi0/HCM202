// Hoàn tác cho "Chơi trên một máy" (mục 12.7): giữ các state trước đó (state
// tuần tự hóa được nên lưu nguyên bản). Hoàn tác khôi phục cả RNG, nên tung lại
// sẽ ra đúng kết quả cũ — không "tung lại cho tới khi đẹp".

import type { GameState } from './types'

export interface History {
  past: GameState[]
  present: GameState
}

export const HISTORY_LIMIT = 50

export function startHistory(state: GameState): History {
  return { past: [], present: state }
}

export function pushHistory(h: History, next: GameState): History {
  const past = [...h.past, h.present]
  if (past.length > HISTORY_LIMIT) past.splice(0, past.length - HISTORY_LIMIT)
  return { past, present: next }
}

export function canUndo(h: History): boolean {
  return h.past.length > 0
}

export function undo(h: History): History {
  if (h.past.length === 0) return h
  const past = h.past.slice(0, -1)
  return { past, present: h.past[h.past.length - 1] }
}
