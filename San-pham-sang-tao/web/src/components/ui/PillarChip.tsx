import { PILLAR_BY_ID } from '../../lib/pillars'
import { PILLAR_CHIP } from '../../lib/pillarStyles'
import type { PillarId } from '../../types'

export default function PillarChip({ pillar }: { pillar: PillarId }) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold tracking-wide uppercase ${PILLAR_CHIP[pillar]}`}
    >
      {PILLAR_BY_ID[pillar].label}
    </span>
  )
}
