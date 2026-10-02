import { OFFLINE } from './offline'
import { site } from './site'

/** Khổ thẻ kết quả PNG (mục 6) */
export type CardFormat = 'story' | 'square'
export const CARD_SIZE: Record<CardFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
}

/**
 * Địa chỉ bản online. Ưu tiên site.json → siteUrl; khi siteUrl còn TODO thì
 * bản online dùng chính địa chỉ đang mở. Trả về null nếu không xác định được
 * (bản offline khi chưa điền siteUrl).
 */
export function onlineUrl(): string | null {
  if (/^https?:\/\//.test(site.siteUrl)) return site.siteUrl
  if (!OFFLINE && /^https?:$/.test(window.location.protocol)) return window.location.origin + window.location.pathname
  return null
}

/** Link chia sẻ theo mức xếp loại: siteUrl + ?kq=<id mức> */
export function shareUrl(levelId: string): string | null {
  const base = onlineUrl()
  return base ? `${base}?kq=${levelId}` : null
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
