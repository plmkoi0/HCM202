// Chọn câu hỏi (mục 5, 8 — bản 1.6):
// - Mỗi lần hỏi rút ngẫu nhiên (theo RNG có seed) một câu từ TOÀN BỘ kho, không xét vị trí
//   trên bàn cờ, không xét độ khó → các mức trộn lẫn suốt ván.
// - Không lặp câu trong ván cho tới khi dùng hết kho; sau đó trộn lại (vòng mới, câu vừa hỏi
//   không ra ngay), ưu tiên câu người đó chưa gặp.

import { pick, shuffle, type RngHolder } from './rng.js'
import type { GameData, PlayerState, Question } from './types.js'

export interface PickContext extends RngHolder {
  usedQuestions: string[]
}

/** Rút một câu; `excludeId` (Đổi câu) không bao giờ được chọn. null khi kho chỉ có câu bị loại. */
export function pickQuestion(data: GameData, ctx: PickContext, player: PlayerState, excludeId?: string): Question | null {
  const pool = data.questions.filter((q) => q.id !== excludeId)
  if (pool.length === 0) return null
  let used = new Set(ctx.usedQuestions)
  let candidates = pool.filter((q) => !used.has(q.id))
  if (candidates.length === 0) {
    // Hết kho: trộn lại thành vòng mới. Câu vừa hỏi gần nhất vẫn tính là "đã dùng" để vòng mới
    // không bắt đầu bằng đúng câu đó.
    const last = ctx.usedQuestions.at(-1)
    ctx.usedQuestions.length = 0
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
