import { useEffect, useRef } from 'react'
import { isTodo } from '../../lib/data'
import { referenceById } from '../../lib/sources'
import { PILLAR_BY_ID } from '../../lib/pillars'
import { site } from '../../lib/site'
import type { Artifact } from '../../types'
import ImageFrame from '../ui/ImageFrame'
import ReferenceText from '../ui/Reference'
import PillarChip from '../ui/PillarChip'
import QuoteBlock from '../ui/QuoteBlock'
import Todo from '../ui/Todo'
import VerifyBadge from '../ui/VerifyBadge'

interface Props {
  artifact: Artifact | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

function refLabel(id: string) {
  const r = referenceById[id]
  if (!r) return `${id} (TODO)`
  if (r.todo) return site.museum.modal.textbookTodo
  return <ReferenceText r={r} />
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <h3 className="flex items-baseline gap-2 text-lg font-bold">
        <span className="font-mono text-xs text-ink-soft">{n}</span>
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** Cửa sổ chi tiết hiện vật gồm 3 khối: Câu chuyện · Bác nói gì · Ngày nay. */
export default function ArtifactModal({ artifact: a, onClose, onPrev, onNext }: Props) {
  const ui = site.museum.modal
  const todo = site.museum.todo
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (a && !d.open) {
      d.showModal()
      document.documentElement.style.overflow = 'hidden'
    } else if (!a && d.open) {
      d.close()
    }
  }, [a])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const handleClose = () => {
      document.documentElement.style.overflow = ''
      onClose()
    }
    d.addEventListener('close', handleClose)
    return () => d.removeEventListener('close', handleClose)
  }, [onClose])

  // Đưa nội dung về đầu khi chuyển sang hiện vật khác
  useEffect(() => {
    ref.current?.querySelector('[data-scroll]')?.scrollTo({ top: 0 })
  }, [a?.id])

  return (
    <dialog
      ref={ref}
      aria-labelledby="artifact-title"
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-sm bg-card p-0 text-ink shadow-2xl backdrop:bg-black/60"
    >
      {a && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
            <span className="font-mono text-sm tracking-wider text-ink-soft">
              {a.id} · {a.date}
            </span>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded px-2 py-1 text-sm font-semibold hover:bg-line"
              aria-label={ui.closeAria}
            >
              {ui.close}
            </button>
          </header>

          <div data-scroll className="overflow-y-auto px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <PillarChip pillar={a.pillar} />
              <span className="text-xs text-ink-soft">{PILLAR_BY_ID[a.pillar].name}</span>
              {!a.verified && <VerifyBadge />}
            </div>
            <h2 id="artifact-title" className="mt-3 text-2xl font-bold sm:text-3xl">
              {a.title}
            </h2>
            {a.subtitle && <p className="mt-1 text-ink-soft">{a.subtitle}</p>}

            <div className="mt-5">
              <ImageFrame image={a.image} />
            </div>

            <div className="mt-6 space-y-6">
              <Block n="01" title={ui.story}>
                {isTodo(a.story) ? <Todo note={todo.story} /> : <p>{a.story}</p>}
              </Block>

              <Block n="02" title={ui.quote}>
                {a.quote ? (
                  <>
                    <QuoteBlock quote={a.quote} />
                    {a.quoteNote && !isTodo(a.quoteNote) && <p className="mt-3 text-sm">{a.quoteNote}</p>}
                  </>
                ) : (
                  <Todo note={a.quoteNote?.replace(/^TODO:?\s*/, '') ?? todo.quote} />
                )}
              </Block>

              <Block n="03" title={ui.today}>
                {isTodo(a.today) ? <Todo note={todo.today} /> : <p>{a.today}</p>}
                {a.todayPrompt && <p className="mt-3 font-serif text-lg italic">{a.todayPrompt}</p>}
              </Block>
            </div>

            <footer className="mt-8 space-y-2 border-t border-line pt-4 text-xs text-ink-soft">
              <p>
                <span className="font-semibold">{ui.eventSource}:</span> {a.eventSource}
              </p>
              {a.sourceIds.length > 0 && (
                <div>
                  <span className="font-semibold">{ui.sources}:</span>
                  <ul className="mt-1 list-disc pl-5">
                    {a.sourceIds.map((id) => (
                      <li key={id}>{refLabel(id)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </footer>
          </div>

          <nav aria-label={ui.navAria} className="flex justify-between gap-2 border-t border-line px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="rounded px-3 py-2 text-sm font-semibold hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {ui.prev}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              className="rounded px-3 py-2 text-sm font-semibold hover:bg-line disabled:opacity-40 disabled:hover:bg-transparent"
            >
              {ui.next}
            </button>
          </nav>
        </div>
      )}
    </dialog>
  )
}
