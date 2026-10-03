import { useEffect, useState } from 'react'
import { resolveReduced, useSettings } from './settings'

/** Giảm hiệu ứng (mục 16): cài đặt "Hiệu ứng chuyển động", "Theo máy" = prefers-reduced-motion */
export function useReducedMotion(): boolean {
  const { motion } = useSettings()
  return resolveReduced(motion, useSystemReducedMotion())
}

/** prefers-reduced-motion của máy */
export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    try {
      return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    } catch {
      return false
    }
  })
  useEffect(() => {
    let mq: MediaQueryList | undefined
    try {
      mq = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')
    } catch {
      return
    }
    if (!mq) return
    const on = () => setReduced(mq!.matches)
    mq.addEventListener?.('change', on)
    return () => mq!.removeEventListener?.('change', on)
  }, [])
  return reduced
}

/** Đồng hồ cập nhật đều để đếm ngược (mặc định 4 lần mỗi giây) */
export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
