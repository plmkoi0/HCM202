// Sổ ôn tập trên máy (mục 12.6, 12.8): id các câu đã trả lời sai ở những ván kết thúc trên máy này.
// Kho câu hỏi lọc được "Câu từng trả lời sai"; ôn lại trả lời đúng thì bỏ khỏi sổ. Chỉ lưu id câu
// hỏi trong localStorage — không gửi đi đâu.
import { load, remove, save } from '../lib/storage'

export const REVIEW_KEY = 'review.v1'
const MAX = 300

/** Sổ câu sai (mới nhất trước), bỏ id không còn trong kho */
export function loadReview(valid?: (id: string) => boolean): string[] {
  const raw = load<unknown>(REVIEW_KEY, [])
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const x of raw) if (typeof x === 'string' && !out.includes(x) && (!valid || valid(x))) out.push(x)
  return out.slice(0, MAX)
}

export function addToReview(ids: readonly string[]): string[] {
  if (ids.length === 0) return loadReview()
  const next = [...new Set(ids)]
  for (const x of loadReview()) if (!next.includes(x)) next.push(x)
  const list = next.slice(0, MAX)
  save(REVIEW_KEY, list)
  return list
}

export function removeFromReview(id: string): string[] {
  const list = loadReview().filter((x) => x !== id)
  save(REVIEW_KEY, list)
  return list
}

export function clearReview(): void {
  remove(REVIEW_KEY)
}
