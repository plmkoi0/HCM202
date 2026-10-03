import type { Pillar } from '../engine/types'
import { PILLAR_ICONS } from './icons'

/** Nhãn trụ cột: màu + biểu tượng + chữ (không chỉ dựa vào màu — mục 16) */
export function PillarChip({ pillar }: { pillar: Pillar }) {
  const I = PILLAR_ICONS[pillar.icon ?? '']
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-sm font-semibold" style={{ borderColor: pillar.color, color: 'var(--ink)' }}>
      {I && <I size={16} color={pillar.color} strokeWidth={2.6} aria-hidden="true" />}
      <span>{pillar.label}</span>
    </span>
  )
}
