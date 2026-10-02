import { site } from '../../lib/site'
import type { Question } from '../../types'
import RelatedChips from './RelatedChips'

interface ItemProps {
  question: Question
  number: number
  /** Lựa chọn của người chơi (thứ tự gốc) */
  chosen?: number
}

/** Một câu khi xem lại: câu hỏi, lựa chọn của người chơi, đáp án đúng, giải thích. */
export function ReviewItem({ question: q, number, chosen }: ItemProps) {
  const ui = site.quiz
  const ok = chosen === q.correctIndex
  return (
    <li className="rounded-sm border border-line bg-card p-4">
      <h5 className="font-serif text-lg font-bold">
        {number}. {q.title}{' '}
        <span className={`font-sans text-sm font-semibold ${ok ? 'text-muc-text' : 'text-son-text'}`}>
          <span aria-hidden="true">{ok ? '✓ ' : '✗ '}</span>
          {ok ? ui.correct : ui.incorrect}
        </span>
      </h5>
      <p className="mt-1 text-sm text-ink-soft">{q.prompt}</p>
      <dl className="mt-3 space-y-1">
        <div>
          <dt className="inline font-semibold">{ui.yourChoice}:</dt> <dd className="inline">{chosen === undefined ? '—' : q.options[chosen]}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">{ui.correctAnswer}:</dt> <dd className="inline">{q.options[q.correctIndex]}</dd>
        </div>
        <div className="text-sm">
          <dt className="inline font-semibold">{ui.explainLabel}:</dt> <dd className="inline">{q.explain}</dd>
        </div>
      </dl>
      <RelatedChips ids={q.relatedArtifacts} />
    </li>
  )
}

/** Danh sách câu (toàn bộ hoặc chỉ câu chưa đúng), giữ số thứ tự gốc. */
export default function Review({ questions, answers, only }: { questions: Question[]; answers: (number | undefined)[]; only?: number[] }) {
  const indexes = only ?? questions.map((_, i) => i)
  return (
    <ol className="space-y-4">
      {indexes.map((i) => (
        <ReviewItem key={questions[i].id} question={questions[i]} number={i + 1} chosen={answers[i]} />
      ))}
    </ol>
  )
}
