import { useEffect, useRef } from 'react'
import { fmt } from '../../lib/format'
import { site } from '../../lib/site'
import type { Question } from '../../types'
import PillarChip from '../ui/PillarChip'
import RelatedChips from './RelatedChips'

interface Props {
  question: Question
  index: number
  total: number
  /** Thứ tự hiển thị đáp án (chỉ số trong question.options), cố định trong lượt chơi */
  order: number[]
  /** Lựa chọn đã chọn (thứ tự gốc); có giá trị nghĩa là câu đã khóa */
  chosen?: number
  onChoose: (optionIndex: number) => void
  onNext: () => void
  isLast: boolean
}

export default function QuestionCard({ question, index, total, order, chosen, onChoose, onNext, isLast }: Props) {
  const ui = site.quiz
  const headingRef = useRef<HTMLHeadingElement>(null)
  const locked = chosen !== undefined
  const isCorrect = chosen === question.correctIndex
  const progressLabel = fmt(ui.progress, { x: index + 1, n: total })

  // Chuyển câu: đưa tiêu điểm về tiêu đề câu để người dùng bàn phím/đọc màn hình theo kịp
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [question.id])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
        <span id="quiz-progress">{progressLabel}</span>
        <PillarChip pillar={question.pillar} />
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

      <ul aria-label={ui.optionsAria} className="mt-6 space-y-3">
        {order.map((oi) => {
          const correct = oi === question.correctIndex
          const mine = oi === chosen
          // Sau khi khóa: tô đáp án đúng và đáp án đã chọn, kèm ✓/✗ và nhãn chữ (không chỉ dựa vào màu)
          const state = !locked ? 'idle' : correct ? 'correct' : mine ? 'wrong' : 'other'
          const box = {
            idle: 'border-line bg-card hover:border-ink',
            correct: 'border-muc bg-muc/10',
            wrong: 'border-son bg-son/10',
            other: 'border-line bg-card text-ink-soft',
          }[state]
          const icon = {
            idle: 'border-ink-soft',
            correct: 'border-muc bg-muc text-on-muc',
            wrong: 'border-son bg-son text-on-son',
            other: 'border-line',
          }[state]
          return (
            <li key={oi}>
              <button
                type="button"
                aria-disabled={locked}
                onClick={() => !locked && onChoose(oi)}
                className={`flex w-full items-start gap-3 rounded-sm border-2 px-4 py-3 text-left transition motion-reduce:transition-none ${box} ${locked ? 'cursor-default' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${icon}`}
                >
                  {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : ''}
                </span>
                <span className="min-w-0">
                  <span className="block">{question.options[oi]}</span>
                  {locked && (correct || mine) && (
                    <span className="mt-1 flex flex-wrap gap-x-3 text-sm font-semibold">
                      {correct && <span className="text-muc-text">{ui.correctAnswer}</span>}
                      {mine && <span className={correct ? 'text-muc-text' : 'text-son-text'}>{ui.yourChoice}</span>}
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* Thông báo Đúng/Chưa đúng cho trình đọc màn hình */}
      <div role="status" aria-live="polite" className="mt-5">
        {locked && (
          <p className={`text-lg font-bold ${isCorrect ? 'text-muc-text' : 'text-son-text'}`}>
            <span aria-hidden="true">{isCorrect ? '✓ ' : '✗ '}</span>
            {isCorrect ? ui.correct : ui.incorrect}
            {!isCorrect && (
              <span className="block text-base font-medium text-ink">
                {ui.correctAnswer}: {question.options[question.correctIndex]}
              </span>
            )}
          </p>
        )}
      </div>

      {locked && (
        <div className="mt-4 border-t border-line pt-4">
          <p>
            <span className="font-semibold">{ui.explainLabel}:</span> {question.explain}
          </p>
          <RelatedChips ids={question.relatedArtifacts} />
          <button
            type="button"
            onClick={onNext}
            className="mt-6 rounded-sm bg-son px-6 py-3 font-semibold text-on-son shadow-sm hover:brightness-110"
          >
            {isLast ? ui.finish : ui.next} →
          </button>
        </div>
      )}
    </div>
  )
}
