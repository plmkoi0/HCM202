import { site } from './site'
import type { CitizenTypeId } from '../types'

/** Khổ thẻ kết quả PNG (mục 6) */
export type CardFormat = 'story' | 'square'
export const CARD_SIZE: Record<CardFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
}

/**
 * Địa chỉ bản online. Ưu tiên site.json → siteUrl; khi siteUrl còn TODO thì
 * bản online dùng chính địa chỉ đang mở. Trả về null nếu không xác định được
 * (vd. mở từ file:// khi chưa điền siteUrl).
 */
export function onlineUrl(): string | null {
  if (/^https?:\/\//.test(site.siteUrl)) return site.siteUrl
  if (/^https?:$/.test(window.location.protocol)) return window.location.origin + window.location.pathname
  return null
}

/** Link chia sẻ theo kết quả: siteUrl + ?kq=X */
export function shareUrl(t: CitizenTypeId): string | null {
  const base = onlineUrl()
  return base ? `${base}?kq=${t}` : null
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Dự phòng cho trình duyệt không cho dùng Clipboard API
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}
