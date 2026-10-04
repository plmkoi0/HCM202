// Điền mẫu chữ trong site.json: "Lượt của {name}" + { name: 'Lan' } → "Lượt của Lan"
export function fill(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))
}

/** mm:ss từ số mili-giây (không âm) */
export function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** ký tự điều khiển, ký tự đổi chiều chữ và ký tự rộng 0 — bỏ khỏi biệt danh (dấu tiếng Việt giữ nguyên) */
const INVISIBLE = /[\p{Cc}\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/gu

/** Bỏ ký tự vô hình, gộp khoảng trắng; trả null nếu không hợp lệ (1–20 ký tự, có ít nhất một chữ / số / ký hiệu nhìn thấy được) */
export function cleanNickname(raw: string): string | null {
  const v = raw.replace(INVISIBLE, ' ').replace(/\s+/g, ' ').trim()
  return v.length >= 1 && [...v].length <= 20 && /[\p{L}\p{N}\p{S}\p{P}]/u.test(v) ? v : null
}
