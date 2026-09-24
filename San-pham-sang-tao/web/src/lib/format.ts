/** Thay {key} trong chuỗi giao diện bằng giá trị tương ứng. */
export function fmt(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`))
}

/** Cuộn tới phần tử, tôn trọng prefers-reduced-motion. */
export function scrollToEl(el: Element | null) {
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
