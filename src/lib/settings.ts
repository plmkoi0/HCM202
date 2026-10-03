// Cài đặt trên máy (mục 12.1, 15.7, 16): âm thanh, hiệu ứng chuyển động, giao diện sáng/tối, cỡ chữ.
// Lưu trong localStorage (bọc try/catch); đọc lại qua `sanitizeSettings` vì dữ liệu cũ có thể sai.
import { useSyncExternalStore } from 'react'
import { load, save } from './storage'

export type MotionPref = 'system' | 'reduce' | 'full'
export type ThemePref = 'system' | 'light' | 'dark'
export type TextSize = 'normal' | 'large'

export interface Settings {
  sound: boolean
  motion: MotionPref
  theme: ThemePref
  textSize: TextSize
}

export const SETTINGS_KEY = 'settings.v1'

export const DEFAULT_SETTINGS: Settings = { sound: true, motion: 'system', theme: 'system', textSize: 'normal' }

const pick = <T extends string>(v: unknown, ok: readonly T[], d: T): T => (ok.includes(v as T) ? (v as T) : d)

export function sanitizeSettings(raw: unknown): Settings {
  const x = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    sound: typeof x.sound === 'boolean' ? x.sound : DEFAULT_SETTINGS.sound,
    motion: pick(x.motion, ['system', 'reduce', 'full'] as const, DEFAULT_SETTINGS.motion),
    theme: pick(x.theme, ['system', 'light', 'dark'] as const, DEFAULT_SETTINGS.theme),
    textSize: pick(x.textSize, ['normal', 'large'] as const, DEFAULT_SETTINGS.textSize),
  }
}

let current: Settings = sanitizeSettings(load<unknown>(SETTINGS_KEY, null))
const listeners = new Set<() => void>()

export function getSettings(): Settings {
  return current
}

export function setSettings(patch: Partial<Settings>): void {
  current = sanitizeSettings({ ...current, ...patch })
  save(SETTINGS_KEY, current)
  applySettings(current)
  for (const l of listeners) l()
}

export function subscribeSettings(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeSettings, getSettings, getSettings)
}

/** Gắn cài đặt lên <html>: data-theme (CSS đổi bảng màu), data-motion, data-text */
export function applySettings(s: Settings = current): void {
  const el = globalThis.document?.documentElement
  if (!el) return
  if (s.theme === 'system') el.removeAttribute('data-theme')
  else el.setAttribute('data-theme', s.theme)
  if (s.motion === 'system') el.removeAttribute('data-motion')
  else el.setAttribute('data-motion', s.motion)
  if (s.textSize === 'large') el.setAttribute('data-text', 'large')
  else el.removeAttribute('data-text')
}

/** Giảm hiệu ứng: theo cài đặt, "Theo máy" thì theo prefers-reduced-motion */
export function resolveReduced(pref: MotionPref, systemReduce: boolean): boolean {
  return pref === 'system' ? systemReduce : pref === 'reduce'
}
