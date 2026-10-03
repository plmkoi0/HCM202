// RNG có seed, lưu trong state (mục 15.3): xúc xắc, power-up, thẻ bẫy, số ô lùi,
// chọn câu, thứ tự đáp án, thứ tự lượt, quyết định của bot.
// Thuật toán mulberry32: trạng thái là một số nguyên 32 bit.

export interface RngHolder {
  rng: number
}

/** Số thực trong [0, 1); cập nhật holder.rng */
export function nextFloat(holder: RngHolder): number {
  const t = (holder.rng + 0x6d2b79f5) >>> 0
  holder.rng = t
  let r = Math.imul(t ^ (t >>> 15), t | 1)
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296
}

/** Số nguyên trong [min, max] (gồm cả hai đầu) */
export function nextInt(holder: RngHolder, min: number, max: number): number {
  return min + Math.floor(nextFloat(holder) * (max - min + 1))
}

export function pick<T>(holder: RngHolder, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick: mảng rỗng')
  return items[Math.floor(nextFloat(holder) * items.length)]
}

/** Chọn theo trọng số; trọng số ≤ 0 không bao giờ được chọn */
export function pickWeighted<T extends { weight: number }>(holder: RngHolder, items: readonly T[]): T {
  const total = items.reduce((s, it) => s + Math.max(0, it.weight), 0)
  if (total <= 0) throw new Error('pickWeighted: tổng trọng số bằng 0')
  let r = nextFloat(holder) * total
  for (const it of items) {
    const w = Math.max(0, it.weight)
    if (r < w) return it
    r -= w
  }
  return items[items.length - 1]
}

/** Trộn Fisher–Yates, trả mảng mới */
export function shuffle<T>(holder: RngHolder, items: readonly T[]): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(nextFloat(holder) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Chuẩn hóa seed bất kỳ thành số nguyên 32 bit không dấu */
export function normalizeSeed(seed: number): number {
  return (Math.floor(seed) >>> 0) || 0x9e3779b9
}
