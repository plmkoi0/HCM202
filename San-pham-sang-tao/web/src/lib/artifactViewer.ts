import { createContext, useContext } from 'react'

export interface ArtifactViewer {
  /** Hiện vật đã mở (tính vào tiến độ "đã xem") */
  seen: Set<string>
  /** Mở ArtifactModal theo id; `list` là thứ tự cho nút Trước/Sau */
  open: (id: string, list?: string[]) => void
}

export const ArtifactViewerContext = createContext<ArtifactViewer | null>(null)

export function useArtifactViewer() {
  const ctx = useContext(ArtifactViewerContext)
  if (!ctx) throw new Error('useArtifactViewer phải nằm trong ArtifactViewerProvider')
  return ctx
}
