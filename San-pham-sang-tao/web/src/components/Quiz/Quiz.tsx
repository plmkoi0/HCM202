import { useRef, useState } from 'react'
import { quiz } from '../../lib/data'
import { scrollToEl } from '../../lib/format'
import { score } from '../../lib/scoring'
import { site } from '../../lib/site'
import type { CitizenTypeId } from '../../types'
import QuestionCard from './QuestionCard'
import Result from './Result'

function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Phase = 'start' | 'play' | 'result'

export default function Quiz() {
  const ui = site.quiz
  const total = quiz.questions.length
  const sectionRef = useRef<HTMLElement>(null)
  const [phase, setPhase] = useState<Phase>('start')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<CitizenTypeId[]>([])
  // Thứ tự đáp án được trộn một lần mỗi lượt chơi
  const [orders, setOrders] = useState<number[][]>([])

  const start = () => {
    setOrders(quiz.questions.map((q) => shuffled(q.options.length)))
    setAnswers([])
    setIdx(0)
    setPhase('play')
    scrollToEl(sectionRef.current)
  }

  const choose = (t: CitizenTypeId) => {
    const next = [...answers]
    next[idx] = t
    setAnswers(next)
    if (idx < total - 1) {
      setIdx(idx + 1)
    } else {
      setPhase('result')
      scrollToEl(sectionRef.current)
    }
  }

  return (
    <section ref={sectionRef} id="quiz" aria-labelledby="quiz-title" className="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <h2 id="quiz-title" className="text-center text-3xl font-bold sm:text-4xl">
          {ui.title}
        </h2>

        <div className="mt-8 rounded-sm border border-line bg-card/60 p-4 sm:p-8">
          {phase === 'start' && (
            <div className="text-center">
              <p className="text-lg">{ui.intro}</p>
              <button
                type="button"
                onClick={start}
                className="mt-6 rounded-sm bg-son px-6 py-3 font-semibold text-on-son shadow-sm hover:brightness-110"
              >
                {ui.start}
              </button>
            </div>
          )}

          {phase === 'play' && (
            <QuestionCard
              question={quiz.questions[idx]}
              index={idx}
              total={total}
              order={orders[idx]}
              selected={answers[idx]}
              onChoose={choose}
              onBack={idx > 0 ? () => setIdx(idx - 1) : undefined}
            />
          )}

          {phase === 'result' && (
            <Result
              typeId={score(answers, quiz.tieBreak).winner}
              answers={answers}
              onRetry={start}
              retryLabel={ui.retry}
            />
          )}
        </div>
      </div>
    </section>
  )
}
