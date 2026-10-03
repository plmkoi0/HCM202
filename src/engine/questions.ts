// Chọn câu hỏi (mục 8):
// - Không lặp câu trong ván cho tới khi dùng hết kho của trụ cột và độ khó đó;
//   sau đó trộn lại (vòng mới, câu vừa hỏi không ra ngay), ưu tiên câu người đó chưa gặp.
// - Tổ hợp trụ cột × độ khó không có câu nào: lấy câu cùng trụ cột ở độ khó gần nhất
//   (bằng khoảng cách thì lấy độ khó thấp hơn); vẫn không có thì lấy trụ cột khác,
//   cùng độ khó, rồi trụ cột khác ở độ khó gần nhất.

import { poolKey } from './data'
import { pick, shuffle, type RngHolder } from './rng'
import type { GameData, PlayerState, Question } from './types'

const DIFFICULTIES = [1, 2, 3]

function byDistance(want: number): number[] {
  return DIFFICULTIES.slice().sort((a, b) => Math.abs(a - want) - Math.abs(b - want) || a - b)
}

/** Kho dùng cho ô yêu cầu (pillar, difficulty), theo quy tắc mượn ở mục 8 */
export function resolvePool(data: GameData, pillar: string, difficulty: number): Question[] {
  for (const d of byDistance(difficulty)) {
    const pool = data.questionPools.get(poolKey(pillar, d))
    if (pool && pool.length > 0) return pool
  }
  const others = data.pillars.map((p) => p.id).filter((id) => id !== pillar)
  for (const d of byDistance(difficulty)) {
    for (const p of others) {
      const pool = data.questionPools.get(poolKey(p, d))
      if (pool && pool.length > 0) return pool
    }
  }
  return data.questions
}

export interface PickContext extends RngHolder {
  usedQuestions: string[]
}

export function pickQuestion(
  data: GameData,
  ctx: PickContext,
  player: PlayerState,
  pillar: string,
  difficulty: number,
  excludeId?: string,
): Question | null {
  const full = resolvePool(data, pillar, difficulty)
  const pool = full.filter((q) => q.id !== excludeId)
  if (pool.length === 0) return null
  let used = new Set(ctx.usedQuestions)
  let candidates = pool.filter((q) => !used.has(q.id))
  if (candidates.length === 0) {
    // Hết kho: trộn lại thành vòng mới cho kho này. Câu vừa hỏi gần nhất của kho vẫn
    // tính là "đã dùng" để vòng mới không bắt đầu bằng đúng câu đó.
    const ids = new Set(full.map((q) => q.id))
    const last = [...ctx.usedQuestions].reverse().find((id) => ids.has(id))
    const kept = ctx.usedQuestions.filter((id) => !ids.has(id))
    ctx.usedQuestions.length = 0
    ctx.usedQuestions.push(...kept)
    if (last !== undefined && pool.length > 1) ctx.usedQuestions.push(last)
    used = new Set(ctx.usedQuestions)
    candidates = pool.filter((q) => !used.has(q.id))
  }
  // Trong vòng hiện tại, ưu tiên câu người đó chưa gặp
  const seen = new Set(player.seen)
  const fresh = candidates.filter((q) => !seen.has(q.id))
  const q = pick(ctx, fresh.length > 0 ? fresh : candidates)
  if (!used.has(q.id)) ctx.usedQuestions.push(q.id)
  if (!seen.has(q.id)) player.seen.push(q.id)
  return q
}

/** Thứ tự hiển thị đáp án (trộn theo seed): order[i] = chỉ số đáp án gốc */
export function answerOrder(ctx: RngHolder, q: Question): number[] {
  return shuffle(
    ctx,
    q.answers.map((_, i) => i),
  )
}
