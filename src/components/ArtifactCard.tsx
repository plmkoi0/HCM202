// Thẻ hiện vật (mục 12.5, N1): mã, ngày, tên, trụ cột, câu chuyện, trích dẫn + quote.cite,
// ghi chú ngữ cảnh. Không có ảnh, "Ngày nay", danh sách nguồn APA.
import { artifacts, gameData, site } from '../lib/gameData'
import { PillarChip } from './PillarChip'
import { RichText } from './RichText'
import { Sheet } from './Sheet'

interface Artifact {
  id: string
  date: string
  title: string
  subtitle?: string
  pillar: string
  story: string
  quote: { text: string; cite: string; lead?: string; paraphrase?: boolean }
  quoteNote?: string
  hidden?: boolean
}

export const ARTIFACTS = (artifacts as Artifact[]).filter((a) => !a.hidden)

export function findArtifact(id: string | undefined): Artifact | undefined {
  return id ? ARTIFACTS.find((a) => a.id === id) : undefined
}

export function ArtifactCard({ id, onClose }: { id: string; onClose: () => void }) {
  const a = findArtifact(id)
  if (!a) return null
  const pillar = gameData.pillars.find((p) => p.id === a.pillar)
  const t = site.game.artifact
  return (
    <Sheet title={a.title} labelledBy="artifact-title" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span className="font-mono font-semibold text-ink">{a.id}</span>
          <span>·</span>
          <span>{a.date}</span>
          {pillar && <PillarChip pillar={pillar} />}
        </p>
        {a.subtitle && <p className="text-sm italic text-ink-soft">{a.subtitle}</p>}
        <section>
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-soft">{t.story}</h3>
          <p className="leading-relaxed">
            <RichText text={a.story} />
          </p>
        </section>
        <section>
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-soft">{t.quote}</h3>
          <blockquote className="border-l-4 border-accent pl-3 font-serif italic leading-relaxed">
            {a.quote.lead && <span className="not-italic">{a.quote.lead} </span>}
            {a.quote.paraphrase ? a.quote.text : `“${a.quote.text}”`}
            <footer className="mt-1 text-sm not-italic text-ink-soft">({a.quote.cite})</footer>
          </blockquote>
          {a.quoteNote && (
            <p className="mt-2 text-sm text-ink-soft">
              <RichText text={a.quoteNote} />
            </p>
          )}
        </section>
        <button type="button" className="btn-secondary self-end" onClick={onClose}>
          {t.close}
        </button>
      </div>
    </Sheet>
  )
}
