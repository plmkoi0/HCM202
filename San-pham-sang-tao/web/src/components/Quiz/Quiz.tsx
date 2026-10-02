import { useCallback, useRef, useState } from 'react'
import { quiz } from '../../lib/data'
import { scrollToEl } from '../../lib/format'
import { useQuizStartRequest } from '../../lib/quizStart'
import { levelFor, score } from '../../lib/scoring'
import { site } from '../../lib/site'
import QuestionCard from './QuestionCard'
import Result from './Result'
import ShareActions from './ShareActions'

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
  // answers[i]: chỉ số lựa chọn (thứ tự gốc) của câu i; đã có giá trị thì câu bị khóa
  const [answers, setAnswers] = useState<(number | undefined)[]>([])
  // Thứ tự đáp án được trộn một lần mỗi lượt chơi
  const [orders, setOrders] = useState<number[][]>([])

  const start = useCallback(() => {
    setOrders(quiz.questions.map((q) => shuffled(q.options.length)))
    setAnswers([])
    setIdx(0)
    setPhase('play')
    scrollToEl(sectionRef.current)
  }, [])

  // "Làm quiz ngay" (hero) và "Bắt đầu quiz" (cầu nối): vào thẳng câu 1.
  // Đang làm dở thì chỉ cuộn tới, không xóa câu trả lời.
  useQuizStartRequest(
    useCallback(() => {
      if (phase === 'play') {
        scrollToEl(sectionRef.current)
        sectionRef.current?.querySelector<HTMLElement>('h3[tabindex]')?.focus({ preventScroll: true })
      } else start()
    }, [phase, start]),
  )

  // Chọn đáp án thì khóa câu; câu đã trả lời không sửa lại được
  const choose = (optionIndex: number) => {
    if (answers[idx] !== undefined) return
    const next = [...answers]
    next[idx] = optionIndex
    setAnswers(next)
  }

  const goNext = () => {
    if (idx < total - 1) setIdx(idx + 1)
    else setPhase('result')
    scrollToEl(sectionRef.current)
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
              chosen={answers[idx]}
              onChoose={choose}
              onNext={goNext}
              isLast={idx === total - 1}
            />
          )}

          {phase === 'result' && <PlayerResult answers={answers} onRetry={start} />}

        </div>
      </div>
    </section>
  )
}

function PlayerResult({ answers, onRetry }: { answers: (number | undefined)[]; onRetry: () => void }) {
  const points = score(quiz.questions, answers)
  const level = levelFor(points, quiz.levels)
  return (
    <Result level={level} points={points} answers={answers} onRetry={onRetry}>
      <ShareActions level={level} points={points} />
    </Result>
  )
}
