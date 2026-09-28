import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArtifactViewerContext } from '../../lib/artifactViewer'
import { artifacts, isVisibleArtifact } from '../../lib/data'
import ArtifactModal from './ArtifactModal'

const STORAGE_KEY = 'hcm202.viewed'

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const ids = raw ? (JSON.parse(raw) as unknown) : []
    // Chỉ giữ id của hiện vật đang hiển thị; id cũ/ẩn bị bỏ và ghi đè khi lưu lại
    return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && isVisibleArtifact(id)) : [])
  } catch {
    return new Set()
  }
}

/** Giữ một ArtifactModal duy nhất cho cả trang (bảo tàng và trang kết quả quiz). */
export default function ArtifactViewerProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [list, setList] = useState<string[]>([])
  const [seen, setSeen] = useState<Set<string>>(loadSeen)

  const open = useCallback((id: string, nextList?: string[]) => {
    if (!isVisibleArtifact(id)) return
    setOpenId(id)
    if (nextList) setList(nextList.filter(isVisibleArtifact))
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

  const value = useMemo(() => ({ seen, open }), [seen, open])
  const current = openId ? (artifacts.find((a) => a.id === openId) ?? null) : null
  const idx = openId ? list.indexOf(openId) : -1
  const prev = idx > 0 ? list[idx - 1] : undefined
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined

  return (
    <ArtifactViewerContext.Provider value={value}>
      {children}
      <ArtifactModal
        artifact={current}
        onClose={close}
        onPrev={prev ? () => open(prev) : undefined}
        onNext={next ? () => open(next) : undefined}
      />
    </ArtifactViewerContext.Provider>
  )
}
