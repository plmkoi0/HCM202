import { useCallback, useEffect, useMemo, useState } from 'react'
import { artifacts } from '../../lib/data'
import ArtifactModal from './ArtifactModal'
import PillarFilter, { type Filter } from './PillarFilter'
import ProgressBar from './ProgressBar'
import Timeline from './Timeline'

const STORAGE_KEY = 'hcm202.viewed'

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export default function Museum() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [seen, setSeen] = useState<Set<string>>(loadSeen)

  const visible = useMemo(
    () => (filter === 'all' ? artifacts : artifacts.filter((a) => a.pillar === filter)),
    [filter],
  )

  const open = useCallback((id: string) => {
    setOpenId(id)
    setSeen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
  }, [])
  const close = useCallback(() => setOpenId(null), [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]))
    } catch {
      // Trình duyệt chặn lưu trữ: tiến độ chỉ giữ trong phiên
    }
  }, [seen])

  const idx = visible.findIndex((a) => a.id === openId)
  const current = openId ? (artifacts.find((a) => a.id === openId) ?? null) : null
  const prev = idx > 0 ? visible[idx - 1] : undefined
  const next = idx >= 0 && idx < visible.length - 1 ? visible[idx + 1] : undefined

  return (
    <section id="bao-tang" aria-labelledby="museum-title" className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 id="museum-title" className="text-3xl font-bold sm:text-4xl">
          Bảo tàng số
        </h2>

        <div className="sticky top-14 z-30 -mx-4 mt-6 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
          <PillarFilter value={filter} onChange={setFilter} artifacts={artifacts} />
          <div className="mt-3">
            <ProgressBar seen={seen.size} total={artifacts.length} />
          </div>
        </div>

        <Timeline artifacts={visible} seen={seen} onOpen={open} />
      </div>

      <ArtifactModal
        artifact={current}
        onClose={close}
        onPrev={prev ? () => open(prev.id) : undefined}
        onNext={next ? () => open(next.id) : undefined}
      />
    </section>
  )
}
