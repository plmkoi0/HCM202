import { useEffect, useRef } from 'react'
import { fmt } from '../../lib/format'
import { site } from '../../lib/site'
import type { CitizenTypeId, Question } from '../../types'

interface Props {
  question: Question
  index: number
  total: number
  /** Thứ tự hiển thị đáp án (chỉ số trong question.options), cố định trong lượt chơi */
  order: number[]
  selected?: CitizenTypeId
  onChoose: (t: CitizenTypeId) => void
  onBack?: () => void
}

export default function QuestionCard({ question, index, total, order, selected, onChoose, onBack }: Props) {
  const ui = site.quiz
  const headingRef = useRef<HTMLHeadingElement>(null)
  const progressLabel = fmt(ui.progress, { x: index + 1, n: total })

  // Chuyển câu: đưa tiêu điểm về tiêu đề để người dùng bàn phím/đọc màn hình theo kịp
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [question.id])

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm font-medium">
        <span id="quiz-progress">{progressLabel}</span>
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          className="rounded px-2 py-1 hover:bg-line disabled:invisible"
        >
          {ui.back}
        </button>
      </div>
      <div
        role="progressbar"
        aria-labelledby="quiz-progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-son transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <h3 ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-bold outline-none sm:text-3xl">
        {question.title}
      </h3>
      <p className="mt-3 text-lg">{question.prompt}</p>

      <ul className="mt-6 space-y-3">
        {order.map((oi, n) => {
          const opt = question.options[oi]
          const active = selected === opt.type
          return (
            <li key={oi}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onChoose(opt.type)}
                className={`flex w-full items-start gap-3 rounded-sm border-2 px-4 py-3 text-left transition motion-reduce:transition-none ${
                  active ? 'border-son bg-son/10' : 'border-line bg-card hover:border-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                    active ? 'border-son bg-son text-on-son' : 'border-ink-soft'
                  }`}
                >
                  {n + 1}
                </span>
                <span>{opt.text}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
