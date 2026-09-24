import { useEffect, useRef, useState } from 'react'

/** Trả về ref và cờ "đã cuộn vào khung nhìn" (chỉ bật một lần). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  // Không có IntersectionObserver: hiện luôn
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  return [ref, visible] as const
}
