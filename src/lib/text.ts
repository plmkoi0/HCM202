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

/** Cắt khoảng trắng, gộp khoảng trắng liền nhau; trả null nếu không hợp lệ (1–20 ký tự) */
export function cleanNickname(raw: string): string | null {
  const v = raw.replace(/\s+/g, ' ').trim()
  return v.length >= 1 && [...v].length <= 20 ? v : null
}
