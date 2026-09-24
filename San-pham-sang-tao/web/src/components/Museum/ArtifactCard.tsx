import { useReveal } from '../../lib/useReveal'
import type { Artifact } from '../../types'
import { PILLAR_BORDER, PILLAR_TEXT } from '../../lib/pillarStyles'
import PillarChip from '../ui/PillarChip'
import VerifyBadge from '../ui/VerifyBadge'

interface Props {
  artifact: Artifact
  seen: boolean
  onOpen: () => void
}

/** Phiếu thư mục: mã HV góc trên, năm lớn, nhãn trụ cột, viền răng cưa nhẹ. */
export default function ArtifactCard({ artifact: a, seen, onOpen }: Props) {
  const [revealRef, visible] = useReveal<HTMLDivElement>()
  return (
    <div ref={revealRef} className={visible ? 'reveal is-visible' : 'reveal'}>
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className={`catalog-card group block w-full border-l-4 px-4 pt-4 pb-5 text-left transition hover:-translate-y-0.5 ${PILLAR_BORDER[a.pillar]}`}
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-mono text-xs tracking-wider text-ink-soft">{a.id}</span>
          {seen && (
            <span className="text-xs font-medium text-ink-soft">
              <span aria-hidden="true">✓ </span>Đã xem
            </span>
          )}
        </span>
        <span className={`mt-1 block font-serif text-4xl font-extrabold ${PILLAR_TEXT[a.pillar]}`}>{a.year}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <PillarChip pillar={a.pillar} />
          <span className="text-xs text-ink-soft">{a.date}</span>
          {!a.verified && <VerifyBadge />}
        </span>
        <span className="mt-2 block font-serif text-lg leading-snug font-semibold group-hover:underline">{a.title}</span>
        {a.subtitle && <span className="mt-1 block text-sm text-ink-soft">{a.subtitle}</span>}
        <span className="mt-3 block text-sm font-medium text-son-text">Xem hiện vật →</span>
      </button>
    </div>
  )
}
