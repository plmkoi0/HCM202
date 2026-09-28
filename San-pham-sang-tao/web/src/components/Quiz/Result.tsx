import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useArtifactViewer } from '../../lib/artifactViewer'
import { artifacts, isVisibleArtifact, quiz } from '../../lib/data'
import { score, TYPE_IDS } from '../../lib/scoring'
import { site } from '../../lib/site'
import type { CitizenTypeId } from '../../types'
import QuoteBlock from '../ui/QuoteBlock'
import Review from './Review'

interface Props {
  typeId: CitizenTypeId
  /** Câu trả lời của người chơi; không có khi mở từ link chia sẻ */
  answers?: CitizenTypeId[]
  onRetry: () => void
  retryLabel: string
  eyebrow: string
  /** Khu vực nút chia sẻ */
  actions?: ReactNode
}

export default function Result({ typeId, answers, onRetry, retryLabel, eyebrow, actions }: Props) {
  const ui = site.quiz
  const type = quiz.types.find((t) => t.id === typeId)!
  const { open } = useArtifactViewer()
  const [showReview, setShowReview] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const result = answers ? score(answers, quiz.tieBreak) : null
  const related = type.relatedArtifacts.filter(isVisibleArtifact)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [typeId])

  return (
    <div>
      <p className="text-sm font-semibold tracking-[0.2em] text-ink-soft uppercase">{eyebrow}</p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-extrabold text-son-text outline-none sm:text-4xl">
        {type.name}
      </h3>
      <p className="mt-3 text-lg">{type.desc}</p>

      <QuoteBlock quote={type.quote} className="mt-6 border-l-4 border-son pl-4" />

      <h4 className="mt-8 text-lg font-bold">{ui.actionsTitle}</h4>
      <ol className="mt-3 space-y-2">
        {type.actions.map((a, i) => (
          <li key={a} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
              {i + 1}
            </span>
            <span>{a}</span>
          </li>
        ))}
      </ol>

      {result && (
        <>
          <h4 className="mt-8 text-lg font-bold">{ui.chartTitle}</h4>
          <ul className="mt-3 space-y-2">
            {TYPE_IDS.map((t) => {
              const name = quiz.types.find((x) => x.id === t)!.name
              const pct = result.percents[t]
              return (
                <li key={t}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className={t === typeId ? 'font-bold' : ''}>{name}</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <div
                      className={`h-full rounded-full ${t === typeId ? 'bg-son' : 'bg-ink-soft'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {related.length > 0 && (
        <>
          <h4 className="mt-8 text-lg font-bold">{ui.relatedTitle}</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((id) => {
              const a = artifacts.find((x) => x.id === id)
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => open(id, related)}
                    className="rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-ink"
                  >
                    <span className="font-mono text-xs text-ink-soft">{id}</span> {a?.title ?? 'TODO'}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <p className="mt-10 border-y border-line py-6 text-center font-serif text-2xl font-bold italic">{quiz.closing}</p>

      {actions}

      <div className="mt-6 flex flex-wrap gap-3">
        {answers && (
          <button
            type="button"
            aria-expanded={showReview}
            aria-controls="quiz-review"
            onClick={() => setShowReview((v) => !v)}
            className="rounded-sm border-2 border-ink px-4 py-2 font-semibold hover:bg-ink hover:text-paper"
          >
            {showReview ? ui.reviewHide : ui.reviewShow}
          </button>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="rounded-sm bg-son px-4 py-2 font-semibold text-on-son hover:brightness-110"
        >
          {retryLabel}
        </button>
      </div>

      {answers && showReview && (
        <div id="quiz-review" className="mt-6">
          <Review answers={answers} />
        </div>
      )}
    </div>
  )
}
