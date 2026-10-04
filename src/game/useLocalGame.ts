import { useCallback, useEffect, useRef, useState } from 'react'
import { currentPlayer, pendingAutoAction, shiftTime } from '../engine/reducer'
import type { Action, ErrorCode, GameData, GameState } from '../engine/types'
import { applyLocal, canUndo, markSeen, storeSave, undoLocal, type LocalSave } from './local'

const SEEN_EVERY_MS = 2000

/**
 * Điều khiển ván "Chơi trên một máy": áp dụng hành động, lưu sau mỗi thay đổi, hoàn tác,
 * tạm dừng (khi mở Menu / hộp xác nhận — đồng hồ ván và hạn pha không trôi).
 * `onEnded` được gọi đúng một lần, ngay khi một hành động làm ván kết thúc.
 */
export function useLocalGame(data: GameData, initial: LocalSave, onEnded?: (s: GameState) => void) {
  const [save, setSave] = useState(initial)
  const [paused, setPausedState] = useState(false)
  const saveRef = useRef(save)
  const pausedAt = useRef<number | null>(null)
  const endedRef = useRef(onEnded)
  useEffect(() => {
    endedRef.current = onEnded
  }, [onEnded])

  const commit = useCallback((next: LocalSave) => {
    saveRef.current = next
    setSave(next)
  }, [])

  useEffect(() => {
    storeSave(save)
  }, [save])

  // dấu "lần cuối thấy" để tải lại không được hoàn giờ (xem resumeLocal); dừng khi tạm dừng
  useEffect(() => {
    if (paused || save.present.phase === 'ended') return
    markSeen(Date.now())
    const id = setInterval(() => markSeen(Date.now()), SEEN_EVERY_MS)
    return () => clearInterval(id)
  }, [paused, save.present.phase])

  const apply = useCallback(
    (action: Action, human: boolean): ErrorCode | null => {
      const prev = saveRef.current.present
      const r = applyLocal(data, saveRef.current, action, human, Date.now())
      if (!r.ok) return r.error
      commit(r.save)
      if (prev.phase !== 'ended' && r.save.present.phase === 'ended') endedRef.current?.(r.save.present)
      return null
    },
    [data, commit],
  )

  /** Thao tác của người đang đến lượt (hoặc người ngồi cùng khi là lượt của máy) */
  const act = useCallback(
    (make: (actor: string, now: number) => Action): ErrorCode | null => {
      const s = saveRef.current.present
      if (s.phase === 'ended') return 'GAME_ENDED'
      const cur = currentPlayer(s)
      const actor = cur.isBot ? (s.players.find((p) => !p.isBot)?.id ?? cur.id) : cur.id
      return apply(make(actor, Date.now()), true)
    },
    [apply],
  )

  const undo = useCallback(() => commit(undoLocal(saveRef.current, Date.now())), [commit])

  /** Tạm dừng / chạy tiếp: khi chạy tiếp, dời hạn pha và giới hạn ván đi đúng thời gian tạm dừng */
  const setPaused = useCallback(
    (p: boolean) => {
      if (p && pausedAt.current === null) pausedAt.current = Date.now()
      if (!p && pausedAt.current !== null) {
        const delta = Date.now() - pausedAt.current
        pausedAt.current = null
        const cur = saveRef.current
        if (cur.present.phase !== 'ended' && delta > 0) commit({ ...cur, present: shiftTime(cur.present, delta) })
      }
      setPausedState(p)
    },
    [commit],
  )

  return { save, state: save.present, act, apply, undo, canUndo: canUndo(save), paused, setPaused }
}

/**
 * Lúc tự gửi hành động kế tiếp (tự tung, hết giờ trả lời, bước của máy, tự sang lượt…).
 * Cửa sổ kết quả (đáp án đúng / bước đi) luôn được hiện đủ thời gian tính từ lúc diễn hoạt
 * xong (`idleAt`), để người xem kịp đọc. Dùng cho cả đồng hồ trên nút "Tiếp tục".
 */
export function autoActionAt(state: GameState, idleAt: number): number | null {
  if (state.phase === 'ended' || state.deadline === null) return null
  if (state.phase !== 'reveal') return state.deadline
  const t = state.config.timers
  return Math.max(state.deadline, idleAt + (state.turn.outcome?.kind === 'answered' ? t.revealMs : t.noticeMs))
}

/** Tự gửi hành động lúc `at`; `waiting` = đang diễn hoạt hoặc tạm dừng → chờ */
export function useAutoActions(state: GameState, at: number | null, waiting: boolean, apply: (a: Action, human: boolean) => ErrorCode | null) {
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  useEffect(() => {
    if (waiting || at === null) return
    const id = setTimeout(() => {
      const s = stateRef.current
      const a = pendingAutoAction(s, Math.max(Date.now(), s.deadline ?? 0))
      if (a) apply(a, false)
    }, Math.max(0, at - Date.now()) + 20)
    return () => clearTimeout(id)
  }, [at, waiting, apply])
}
