import type { CitizenTypeId } from '../types'

export const TYPE_IDS: CitizenTypeId[] = ['A', 'B', 'C', 'D']

export interface ScoreResult {
  counts: Record<CitizenTypeId, number>
  /** Tỉ lệ phần trăm (làm tròn) của từng kiểu */
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

  const total = answers.length
  const percents = Object.fromEntries(
    TYPE_IDS.map((t) => [t, total ? Math.round((counts[t] / total) * 100) : 0]),
  ) as Record<CitizenTypeId, number>

  return { counts, percents, winner }
}

export function isTypeId(v: unknown): v is CitizenTypeId {
  return typeof v === 'string' && (TYPE_IDS as string[]).includes(v)
}
