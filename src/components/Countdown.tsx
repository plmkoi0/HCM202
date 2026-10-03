import { useNow } from '../lib/hooks'

/** Thanh đếm ngược tới `deadline` (giờ máy) */
export function Countdown({ deadline, total, label }: { deadline: number | null; total: number; label: (s: number) => string }) {
  const now = useNow(200)
  if (deadline === null) return null
  const left = Math.max(0, deadline - now)
  const pct = Math.max(0, Math.min(100, (left / total) * 100))
  const s = Math.ceil(left / 1000)
  return (
    <div className="flex items-center gap-2" aria-live="off">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className={`h-full rounded-full ${s <= 5 ? 'bg-bad' : 'bg-accent'}`} style={{ width: `${pct}%`, transition: 'width 200ms linear' }} />
      </div>
      <span className="min-w-[4.5rem] text-right text-sm font-semibold tabular-nums">{label(s)}</span>
    </div>
  )
}
