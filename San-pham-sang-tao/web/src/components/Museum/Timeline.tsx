import type { Artifact } from '../../types'
import { PILLAR_CHIP } from '../../lib/pillarStyles'
import ArtifactCard from './ArtifactCard'

interface Props {
  artifacts: Artifact[]
  seen: Set<string>
  onOpen: (id: string) => void
}

/** Dòng thời gian dọc: một cột trên điện thoại, so le hai bên trên màn hình rộng. */
export default function Timeline({ artifacts, seen, onOpen }: Props) {
  return (
    <ol className="relative mt-8 space-y-6 before:absolute before:top-0 before:bottom-0 before:left-[7px] before:w-0.5 before:bg-line md:before:left-1/2 md:before:-translate-x-1/2">
      {artifacts.map((a, i) => {
        const right = i % 2 === 1
        return (
          <li key={a.id} className="relative pl-8 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
            <span
              aria-hidden="true"
              className={`absolute top-6 left-0 h-4 w-4 rounded-full border-2 border-paper md:left-1/2 ${PILLAR_CHIP[a.pillar]} md:-translate-x-1/2`}
            />
            <div className={right ? 'md:col-start-2' : 'md:col-start-1'}>
              <ArtifactCard artifact={a} seen={seen.has(a.id)} onOpen={() => onOpen(a.id)} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
