import { site } from '../../lib/site'

/** "Bạn đã xem {x}/{n} hiện vật" (site.json): tô đậm số đã xem. */
function label(seen: number, total: number) {
  return site.museum.progress.split(/(\{x\}|\{n\})/).map((part, i) =>
    part === '{x}' ? <strong key={i}>{seen}</strong> : part === '{n}' ? total : part,
  )
}

export default function ProgressBar({ seen, total }: { seen: number; total: number }) {
  const pct = total ? Math.round((seen / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <p id="museum-progress" className="shrink-0 text-sm font-medium" aria-live="polite">
        {label(seen, total)}
      </p>
      <div
        role="progressbar"
        aria-labelledby="museum-progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={seen}
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-son transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
