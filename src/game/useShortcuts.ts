// Phím tắt trên máy tính (mục 16): Space = tung / tiếp tục · 1–4 hoặc A–D = chọn đáp án ·
// Q/W = dùng power-up 1/2 · M = tắt tiếng · F = toàn màn hình. Không bắt phím khi đang gõ chữ,
// khi có Ctrl/Alt/⌘, hay khi Space rơi vào một nút đang có tiêu điểm (nút tự bấm).
import { useEffect, useRef } from 'react'
import { getSettings, setSettings } from '../lib/settings'
import { playSound } from '../lib/sound'

export type Shortcut = { kind: 'primary' } | { kind: 'answer'; pos: number } | { kind: 'power'; slot: number } | { kind: 'mute' } | { kind: 'fullscreen' }

const ANSWER_KEYS: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 }

/** Phím → thao tác (thuần, để test). `target` = phần tử nhận phím. */
export function shortcutOf(e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'repeat'>, target: EventTarget | null): Shortcut | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null
  const el = target as HTMLElement | null
  const tag = el?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || el?.isContentEditable) return null
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
  if (key === ' ' || key === 'Spacebar') {
    // Space trên nút / liên kết: để trình duyệt tự bấm phần tử đó
    if (tag === 'button' || tag === 'a' || tag === 'summary' || el?.getAttribute?.('role') === 'button') return null
    return e.repeat ? null : { kind: 'primary' }
  }
  if (e.repeat) return null
  if (key in ANSWER_KEYS) return { kind: 'answer', pos: ANSWER_KEYS[key] }
  if (key === 'q') return { kind: 'power', slot: 0 }
  if (key === 'w') return { kind: 'power', slot: 1 }
  if (key === 'm') return { kind: 'mute' }
  if (key === 'f') return { kind: 'fullscreen' }
  return null
}

export function toggleSound(): boolean {
  const on = !getSettings().sound
  setSettings({ sound: on })
  if (on) playSound('tap')
  return on
}

export function toggleFullscreen(): void {
  try {
    const d = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
    if (d.fullscreenElement ?? d.webkitFullscreenElement) {
      if (d.exitFullscreen) void d.exitFullscreen().catch(() => {})
      else d.webkitExitFullscreen?.()
    } else if (el.requestFullscreen) void el.requestFullscreen().catch(() => {})
    else el.webkitRequestFullscreen?.()
  } catch {
    // trình duyệt nhúng (Zalo, Messenger) có thể không cho toàn màn hình — bỏ qua
  }
}

export function canFullscreen(): boolean {
  try {
    const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }
    return typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function'
  } catch {
    return false
  }
}

export interface ShortcutHandlers {
  primary?: () => void
  answer?: (pos: number) => void
  power?: (slot: number) => void
}

/**
 * Gắn phím tắt cho màn chơi. `enabled = false` khi có hộp thoại khác đang mở (thẻ hiện vật, xác
 * nhận thoát, cài đặt) — lúc đó chỉ còn M và F.
 */
export function useShortcuts(handlers: ShortcutHandlers, enabled: boolean): void {
  const ref = useRef(handlers)
  const on = useRef(enabled)
  useEffect(() => {
    ref.current = handlers
    on.current = enabled
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      const s = shortcutOf(e, e.target)
      if (!s) return
      if (s.kind === 'mute') {
        toggleSound()
        return
      }
      if (s.kind === 'fullscreen') {
        toggleFullscreen()
        return
      }
      if (!on.current) return
      const h = ref.current
      if (s.kind === 'primary' && h.primary) {
        e.preventDefault()
        h.primary()
      } else if (s.kind === 'answer' && h.answer) h.answer(s.pos)
      else if (s.kind === 'power' && h.power) h.power(s.slot)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
