import { PILLARS } from '../../lib/pillars'
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
    { id: 'all', label: 'Tất cả', count: artifacts.length },
    ...PILLARS.map((p) => ({ id: p.id, label: p.label, count: artifacts.filter((a) => a.pillar === p.id).length })),
  ]
  return (
    <div role="group" aria-label="Lọc theo trụ cột" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.id
        const activeCls = o.id === 'all' ? 'bg-ink text-paper border-ink' : `${PILLAR_CHIP[o.id]} border-transparent`
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
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
