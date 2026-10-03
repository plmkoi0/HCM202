// Pháo giấy khi về đích (mục 16): canvas tự vẽ, ~2,5 giây, không nhận thao tác, tắt khi giảm hiệu ứng.
import { useEffect, useRef } from 'react'
import { tokens } from '../lib/gameData'

const DURATION = 2600

export function Confetti({ burst, reduced }: { burst: number; reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!burst || reduced) return
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, globalThis.devicePixelRatio || 1)
    const w = (canvas.width = Math.round(innerWidth * dpr))
    const h = (canvas.height = Math.round(innerHeight * dpr))
    const colors = [...tokens.colors.map((c) => c.color), '#F2C14E', '#B3262D']
    const pieces = Array.from({ length: 140 }, (_, i) => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.3,
      y: h * 0.35,
      vx: (Math.random() - 0.5) * 18 * dpr,
      vy: (-Math.random() * 16 - 6) * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      s: (5 + Math.random() * 6) * dpr,
      c: colors[i % colors.length],
    }))
    const t0 = performance.now()
    let raf = 0
    const frame = (t: number) => {
      const el = t - t0
      ctx.clearRect(0, 0, w, h)
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, el - DURATION * 0.6) / (DURATION * 0.4))
      for (const p of pieces) {
        p.vy += 0.55 * dpr
        p.vx *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.r += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.r)
        ctx.fillStyle = p.c
        ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
        ctx.restore()
      }
      if (el < DURATION) raf = requestAnimationFrame(frame)
      else ctx.clearRect(0, 0, w, h)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, w, h)
    }
  }, [burst, reduced])
  if (reduced) return null
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />
}
