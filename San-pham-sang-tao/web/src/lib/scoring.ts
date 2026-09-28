import type { CitizenTypeId } from '../types'

export const TYPE_IDS: CitizenTypeId[] = ['A', 'B', 'C', 'D']

export interface ScoreResult {
  counts: Record<CitizenTypeId, number>
  /** Tỉ lệ phần trăm nguyên của từng kiểu; tổng luôn bằng 100 (khi có câu trả lời) */
  percents: Record<CitizenTypeId, number>
  winner: CitizenTypeId
}

/**
 * Mỗi lựa chọn +1 điểm cho kiểu tương ứng (mục 5.3).
 * Hòa điểm: chọn kiểu đứng trước trong tieBreak (C → D → B → A).
 */
export function score(answers: CitizenTypeId[], tieBreak: CitizenTypeId[]): ScoreResult {
  const counts: Record<CitizenTypeId, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const a of answers) counts[a] += 1

  const max = Math.max(...TYPE_IDS.map((t) => counts[t]))
  const order = [...tieBreak, ...TYPE_IDS.filter((t) => !tieBreak.includes(t))]
  const winner = order.find((t) => counts[t] === max)!

  return { counts, percents: toPercents(counts, answers.length, order), winner }
}

/**
 * Phương pháp phần dư lớn nhất: lấy phần nguyên của từng tỉ lệ, rồi chia phần
 * còn thiếu (để đủ 100) cho các kiểu có phần dư lớn nhất. Phần dư bằng nhau thì
 * ưu tiên theo thứ tự `order` (tieBreak).
 */
function toPercents(
  counts: Record<CitizenTypeId, number>,
  total: number,
  order: CitizenTypeId[],
): Record<CitizenTypeId, number> {
  const percents: Record<CitizenTypeId, number> = { A: 0, B: 0, C: 0, D: 0 }
  if (!total) return percents

  // Dùng số nguyên để tránh sai số dấu phẩy động: count*100 = floor*total + remainder
  const remainder = {} as Record<CitizenTypeId, number>
  for (const t of TYPE_IDS) {
    percents[t] = Math.floor((counts[t] * 100) / total)
    remainder[t] = (counts[t] * 100) % total
  }
  const missing = 100 - TYPE_IDS.reduce((sum, t) => sum + percents[t], 0)
  const byRemainder = [...order].sort((a, b) => remainder[b] - remainder[a])
  for (const t of byRemainder.slice(0, missing)) percents[t] += 1
  return percents
}

export function isTypeId(v: unknown): v is CitizenTypeId {
  return typeof v === 'string' && (TYPE_IDS as string[]).includes(v)
}
