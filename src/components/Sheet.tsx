import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Cửa sổ: trên điện thoại là tấm trượt từ dưới lên, trên máy tính là hộp giữa màn hình
 * (mục 12.5). Giữ tiêu điểm trong cửa sổ (Tab vòng lại), ưu tiên phần tử `data-autofocus`,
 * đóng thì trả tiêu điểm về chỗ cũ.
 */
export function Sheet({ title, children, onClose, labelledBy, tone = 'default' }: { title?: ReactNode; children: ReactNode; onClose?: () => void; labelledBy?: string; tone?: 'default' | 'good' | 'bad' }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const first = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el
    first.focus({ preventScroll: true })
    return () => {
      if (before && before.isConnected) before.focus({ preventScroll: true })
    }
  }, [])
  // nội dung đổi (ví dụ câu hỏi → giải thích): nút cũ bị gỡ thì đưa tiêu điểm về nút data-autofocus mới
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new MutationObserver(() => {
      const a = document.activeElement
      if (a && a !== el && el.contains(a) && !(a as HTMLButtonElement).disabled) return
      el.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
    })
    obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose()
      if (e.key !== 'Tab') return
      const el = ref.current
      if (!el) return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const i = items.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        items[items.length - 1].focus()
      } else if (!e.shiftKey && (i === -1 || i === items.length - 1)) {
        e.preventDefault()
        items[0].focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const border = tone === 'good' ? 'border-ok' : tone === 'bad' ? 'border-bad' : 'border-line'
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 sm:items-center sm:p-6" role="presentation">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`sheet-in max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-t-4 bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl outline-none sm:max-w-xl sm:rounded-3xl sm:border-4 sm:p-6 ${border}`}
      >
        {title && (
          <h2 id={labelledBy} className="mb-3 font-serif text-xl font-bold">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
