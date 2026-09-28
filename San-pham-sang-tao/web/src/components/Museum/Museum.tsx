import { useMemo, useState } from 'react'
import { useArtifactViewer } from '../../lib/artifactViewer'
import { artifacts } from '../../lib/data'
import { site } from '../../lib/site'
import PillarFilter, { type Filter } from './PillarFilter'
import ProgressBar from './ProgressBar'
import Timeline from './Timeline'

export default function Museum() {
  const [filter, setFilter] = useState<Filter>('all')
  const { seen, open } = useArtifactViewer()

  const visible = useMemo(
    () => (filter === 'all' ? artifacts : artifacts.filter((a) => a.pillar === filter)),
    [filter],
  )
  const visibleIds = useMemo(() => visible.map((a) => a.id), [visible])

  return (
    <section id="bao-tang" aria-labelledby="museum-title" className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 id="museum-title" className="text-3xl font-bold sm:text-4xl">
          {site.museum.title}
        </h2>

        <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-line bg-paper/95 px-4 py-1.5 backdrop-blur md:py-3">
          <PillarFilter value={filter} onChange={setFilter} artifacts={artifacts} />
          <div className="mt-1.5 md:mt-3">
            <ProgressBar seen={seen.size} total={artifacts.length} />
          </div>
        </div>

        <Timeline artifacts={visible} seen={seen} onOpen={(id) => open(id, visibleIds)} />
      </div>
    </section>
  )
}
