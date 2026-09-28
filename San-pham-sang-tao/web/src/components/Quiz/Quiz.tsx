import { useCallback, useEffect, useRef, useState } from 'react'
import { quiz } from '../../lib/data'
import { scrollToEl } from '../../lib/format'
import { useQuizStartRequest } from '../../lib/quizStart'
import { isTypeId, score } from '../../lib/scoring'
import { site } from '../../lib/site'
import type { CitizenTypeId } from '../../types'
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

type Phase = 'start' | 'play' | 'result' | 'shared'

/** Đọc ?kq=A|B|C|D; bỏ qua giá trị không hợp lệ. */
function sharedType(): CitizenTypeId | null {
  const kq = new URLSearchParams(window.location.search).get('kq')
  return isTypeId(kq) ? kq : null
}

export default function Quiz() {
  const ui = site.quiz
  const total = quiz.questions.length
  const sectionRef = useRef<HTMLElement>(null)
  const [sharedId] = useState(sharedType)
  const [phase, setPhase] = useState<Phase>(sharedId ? 'shared' : 'start')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<CitizenTypeId[]>([])
  // Thứ tự đáp án được trộn một lần mỗi lượt chơi
  const [orders, setOrders] = useState<number[][]>([])

  // Mở từ link chia sẻ: cuộn tới trang kết quả
  useEffect(() => {
    if (sharedId) requestAnimationFrame(() => scrollToEl(sectionRef.current))
  }, [sharedId])

  const start = useCallback(() => {
    if (sharedId) {
      // Bỏ ?kq khỏi địa chỉ để làm lại không mở lại kết quả cũ
      try {
        const u = new URL(window.location.href)
        u.searchParams.delete('kq')
        window.history.replaceState(null, '', u)
      } catch {
        // Một số trình duyệt chặn đổi địa chỉ khi mở từ file://; bỏ qua
      }
    }
    setOrders(quiz.questions.map((q) => shuffled(q.options.length)))
    setAnswers([])
    setIdx(0)
    setPhase('play')
    scrollToEl(sectionRef.current)
  }, [sharedId])

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

          {phase === 'result' && <PlayerResult answers={answers} onRetry={start} />}

          {phase === 'shared' && sharedId && (
            <Result
              typeId={sharedId}
              eyebrow={site.share.sharedEyebrow}
              onRetry={start}
              retryLabel={site.share.takeQuiz}
              actions={<ShareActions typeId={sharedId} />}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function PlayerResult({ answers, onRetry }: { answers: CitizenTypeId[]; onRetry: () => void }) {
  const winner = score(answers, quiz.tieBreak).winner
  return (
    <Result
      typeId={winner}
      answers={answers}
      eyebrow={site.quiz.resultEyebrow}
      onRetry={onRetry}
      retryLabel={site.quiz.retry}
      actions={<ShareActions typeId={winner} />}
    />
  )
}
