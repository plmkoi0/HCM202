import { site } from './site'
import type { CitizenTypeId } from '../types'

/** Khổ thẻ kết quả PNG (mục 6) */
export type CardFormat = 'story' | 'square'
export const CARD_SIZE: Record<CardFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
}

/** Link chia sẻ theo kết quả: siteUrl + ?kq=X */
export const shareUrl = (t: CitizenTypeId) => `${site.siteUrl}?kq=${t}`

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
