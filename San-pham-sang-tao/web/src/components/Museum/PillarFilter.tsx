import { PILLARS } from '../../lib/pillars'
import { site } from '../../lib/site'
import type { Artifact, PillarId } from '../../types'
import { PILLAR_CHIP } from '../../lib/pillarStyles'

export type Filter = 'all' | PillarId

interface Props {
  value: Filter
  onChange: (f: Filter) => void
  artifacts: Artifact[]
}

export default function PillarFilter({ value, onChange, artifacts }: Props) {
  const options: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: site.museum.filterAll, count: artifacts.length },
    ...PILLARS.map((p) => ({ id: p.id, label: p.label, count: artifacts.filter((a) => a.pillar === p.id).length })),
  ]
  return (
    // Dưới md: một hàng, cuộn ngang trong khung riêng (không xuống dòng, không đẩy trang rộng ra).
    // py-1 chừa chỗ cho viền focus, vì khung cuộn cắt phần tràn theo chiều dọc.
    <div
      role="group"
      aria-label={site.museum.filterAria}
      className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {options.map((o) => {
        const active = value === o.id
        const activeCls = o.id === 'all' ? 'bg-ink text-paper border-ink' : `${PILLAR_CHIP[o.id]} border-transparent`
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            // Hàng cuộn ngang: đưa nút đang được focus (bàn phím) vào hẳn khung nhìn
            onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
            className={`shrink-0 rounded-full border px-3.5 py-1 text-sm font-medium whitespace-nowrap transition focus-visible:outline-offset-1 md:py-1.5 ${
              active ? activeCls : 'border-line bg-card hover:border-ink'
            }`}
          >
            {o.label} <span className="opacity-75">({o.count})</span>
          </button>
        )
      })}
    </div>
  )
}
