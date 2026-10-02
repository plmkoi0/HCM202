import { useArtifactViewer } from '../../lib/artifactViewer'
import { artifacts, isVisibleArtifact } from '../../lib/data'
import { site } from '../../lib/site'

/** Chip "Hiện vật liên quan": mở ArtifactModal có sẵn (tính vào tiến độ "đã xem"). */
export default function RelatedChips({ ids }: { ids: string[] }) {
  const { open } = useArtifactViewer()
  const related = ids.filter(isVisibleArtifact)
  if (related.length === 0) return null
  return (
    <div className="mt-3">
      <p className="text-sm font-semibold">{site.quiz.relatedTitle}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {related.map((id) => (
          <li key={id}>
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => open(id, related)}
              className="rounded-full border border-line bg-card px-3 py-1.5 text-left text-sm hover:border-ink"
            >
              <span className="font-mono text-xs text-ink-soft">{id}</span> {artifacts.find((a) => a.id === id)?.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
