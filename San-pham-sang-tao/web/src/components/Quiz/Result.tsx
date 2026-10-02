import { useEffect, useRef, useState, type ReactNode } from 'react'
import { quiz } from '../../lib/data'
import { fmt } from '../../lib/format'
import { site } from '../../lib/site'
import type { Level } from '../../types'
import Review from './Review'

interface Props {
  level: Level
  points: number
  answers: (number | undefined)[]
  onRetry: () => void
  /** Khu vực tải thẻ kết quả */
  children?: ReactNode
}

export default function Result({ level, points, answers, onRetry, children }: Props) {
  const ui = site.quiz
  const { questions } = quiz
  const [showAll, setShowAll] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const wrong = questions.map((_, i) => i).filter((i) => answers[i] !== questions[i].correctIndex)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [level.id])

  return (
    <div>
      <p className="text-sm font-semibold tracking-[0.2em] text-ink-soft uppercase">{ui.resultEyebrow}</p>
      <p className="mt-3 flex items-baseline gap-3">
        <span className="text-sm font-semibold text-ink-soft uppercase">{ui.scoreLabel}</span>
        <span className="font-serif text-5xl font-extrabold text-son-text sm:text-6xl">
          {fmt(ui.scoreValue, { score: points, total: questions.length })}
        </span>
      </p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-extrabold text-son-text outline-none sm:text-4xl">
        {level.name}
      </h3>
      <p className="mt-3 text-lg">{level.message}</p>

      <p className="mt-8 border-y border-line py-6 text-center font-serif text-2xl font-bold italic">{quiz.closing}</p>

      {children}

      <section aria-labelledby="quiz-wrong-title" className="mt-8">
        <h4 id="quiz-wrong-title" className="text-lg font-bold">
          {ui.wrongTitle} ({wrong.length})
        </h4>
        <div className="mt-3">
          {wrong.length ? <Review questions={questions} answers={answers} only={wrong} /> : <p>{ui.allCorrect}</p>}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          aria-expanded={showAll}
          aria-controls="quiz-review"
          onClick={() => setShowAll((v) => !v)}
          className="rounded-sm border-2 border-ink px-4 py-2 font-semibold hover:bg-ink hover:text-paper"
        >
          {showAll ? ui.reviewHide : ui.reviewShow}
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-sm bg-son px-4 py-2 font-semibold text-on-son hover:brightness-110"
        >
          {ui.retry}
        </button>
      </div>

      {showAll && (
        <div id="quiz-review" className="mt-6">
          <Review questions={questions} answers={answers} />
        </div>
      )}
    </div>
  )
}
