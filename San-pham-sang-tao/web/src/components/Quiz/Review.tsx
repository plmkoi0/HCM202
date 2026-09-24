import { quiz } from '../../lib/data'
import { site } from '../../lib/site'
import type { CitizenTypeId } from '../../types'

/** Liệt kê lựa chọn của người chơi kèm phần giải thích của từng câu. */
export default function Review({ answers }: { answers: CitizenTypeId[] }) {
  const ui = site.quiz
  return (
    <ol className="space-y-5">
      {quiz.questions.map((q, i) => {
        const chosen = q.options.find((o) => o.type === answers[i])
        return (
          <li key={q.id} className="rounded-sm border border-line bg-card p-4">
            <h4 className="font-serif text-lg font-bold">
              {i + 1}. {q.title}
            </h4>
            <p className="mt-1 text-sm text-ink-soft">{q.prompt}</p>
            <p className="mt-3">
              <span className="font-semibold">{ui.yourChoice}:</span> {chosen?.text ?? '—'}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">{ui.explainLabel}:</span> {q.explain}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
