// Ôn tập (mục 12.6, 12.8): trả lời lại từng câu, không ảnh hưởng ván; sau khi chọn chỉ hiện
// Đúng / Sai và đáp án đúng (bản 1.6). Dùng cho "Làm lại câu sai" (màn kết thúc).
import { Check, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { answerOrder } from '../engine/questions'
import { shortcutOf } from '../game/useShortcuts'
import { gameData, site } from '../lib/gameData'
import { playSound } from '../lib/sound'
import { fill } from '../lib/text'
import { Sheet } from './Sheet'

const LETTERS = ['A', 'B', 'C', 'D']

export function Practice({ ids, onClose, onCorrect }: { ids: string[]; onClose: () => void; onCorrect?: (id: string) => void }) {
  const t = site.practice
  const qt = site.game.question
  const questions = useMemo(() => ids.map((id) => gameData.questionById.get(id)).filter((q) => q !== undefined), [ids])
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const done = index >= questions.length
  const q = done ? null : questions[index]
  // trộn đáp án như trong ván (mục 8)
  const order = useMemo(() => (q ? answerOrder({ rng: (seed + index * 7919) % 2 ** 31 }, q) : []), [q, seed, index])
  const revealed = chosen !== null
  const correct = revealed && q !== null && chosen === q.correct

  const choose = (orig: number) => {
    if (revealed || !q) return
    setChosen(orig)
    const ok = orig === q.correct
    playSound(ok ? 'correct' : 'wrong')
    if (ok) {
      setScore((s) => s + 1)
      onCorrect?.(q.id)
    }
  }
  const next = () => {
    setChosen(null)
    setIndex((i) => i + 1)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = shortcutOf(e, e.target)
      if (!s) return
      if (s.kind === 'answer' && !revealed && order[s.pos] !== undefined) choose(order[s.pos])
      else if (s.kind === 'primary' && revealed) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (done || !q) {
    return (
      <Sheet title={t.title} labelledBy="practice-title" onClose={onClose}>
        <p className="mb-4 text-lg font-semibold" aria-live="polite">
          {questions.length === 0 ? t.empty : fill(t.summary, { n: score, total: questions.length })}
        </p>
        <button type="button" className="btn-primary w-full" data-autofocus onClick={onClose}>
          {t.close}
        </button>
      </Sheet>
    )
  }
  return (
    <Sheet labelledBy="practice-q" onClose={onClose} tone={revealed ? (correct ? 'good' : 'bad') : 'default'}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold">{t.title}</span>
          <span className="text-ink-soft">{fill(t.progress, { n: index + 1, total: questions.length })}</span>
          <span className="rounded-full bg-line px-2.5 py-0.5 font-semibold">{fill(qt.difficulty, { n: q.difficulty })}</span>
          {q.test && <span className="rounded-full border border-ink-soft px-2 py-0.5 text-ink-soft">{site.testLabel}</span>}
        </div>
        <h2 id="practice-q" className="text-base font-semibold leading-snug sm:text-xl">
          {q.question}
        </h2>
        <p className="sr-only" aria-live="polite">
          {revealed ? (correct ? qt.correct : qt.wrong) : ''}
        </p>
        <div role="group" aria-label={qt.answersLabel} className="flex flex-col gap-2">
          {order.map((orig, pos) => {
            const isCorrect = revealed && orig === q.correct
            const isChosen = revealed && orig === chosen
            return (
              <button
                key={orig}
                type="button"
                className={isCorrect ? 'answer answer-correct' : isChosen ? 'answer answer-wrong' : 'answer'}
                disabled={revealed}
                onClick={() => choose(orig)}
                data-practice-answer={pos}
              >
                <span className="answer-letter" aria-hidden="true">
                  {LETTERS[pos]}
                </span>
                <span className="flex-1 text-left">{q.answers[orig]}</span>
                {isCorrect && (
                  <span className="flex items-center gap-1 text-sm font-bold text-ok">
                    <Check size={18} aria-hidden="true" /> <span className="sr-only sm:not-sr-only">{qt.correctAnswer}</span>
                  </span>
                )}
                {isChosen && !isCorrect && (
                  <span className="flex items-center gap-1 text-sm font-bold text-bad">
                    <X size={18} aria-hidden="true" /> <span className="sr-only sm:not-sr-only">{qt.chosen}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {revealed && (
          <>
            <p className={`text-xl font-bold ${correct ? 'text-ok' : 'text-bad'}`}>{correct ? qt.correct : qt.wrong}</p>
            <p className="rounded-2xl bg-bg p-3" data-correct-answer>
              <span className="font-bold text-ink-soft">{qt.correctAnswer}:</span> {q.answers[q.correct]}
            </p>
            <button type="button" className="btn-primary" data-autofocus onClick={next}>
              {index + 1 < questions.length ? t.next : t.finish}
            </button>
          </>
        )}
        {!revealed && (
          <button type="button" className="btn-link self-start" onClick={onClose}>
            {t.stop}
          </button>
        )}
      </div>
    </Sheet>
  )
}
