// Kho câu hỏi (mục 12.8, bản 1.6): "Tổng số câu hỏi: N", lọc theo độ khó / Sổ ôn tập / câu hỏi
// thử, nhãn [Câu hỏi thử] (nếu có), đáp án ẩn mặc định (nút hiện), ôn tập các câu đang lọc. Không
// có trụ cột, nguồn, [Chờ xác minh]. Chỉ mở được từ trang chủ — không có khi đang ở trong phòng (L5).
import { Check, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Practice } from '../components/Practice'
import { clearReview, loadReview, removeFromReview } from '../game/review'
import { gameData, questionList, site } from '../lib/gameData'
import { fill } from '../lib/text'

const LETTERS = ['A', 'B', 'C', 'D']

type Filter = { difficulty: number | 'all'; wrong: boolean; test: boolean; text: string }

/** bỏ dấu tiếng Việt để tìm không phân biệt dấu */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

export function QuestionBank({ onBack }: { onBack: () => void }) {
  const t = site.bank
  const [f, setF] = useState<Filter>({ difficulty: 'all', wrong: false, test: false, text: '' })
  const [shown, setShown] = useState<Set<string>>(new Set())
  const [review, setReview] = useState(() => loadReview((id) => gameData.questionById.has(id)))
  const [practice, setPractice] = useState<string[] | null>(null)
  const set = (patch: Partial<Filter>) => setF((x) => ({ ...x, ...patch }))
  const hasTest = questionList.some((q) => q.test)
  const difficulties = [...new Set(questionList.map((q) => q.difficulty))].sort()

  const list = useMemo(() => {
    const needle = fold(f.text.trim())
    const wrongSet = new Set(review)
    const out = questionList.filter(
      (q) =>
        (f.difficulty === 'all' || q.difficulty === f.difficulty) &&
        (!f.wrong || wrongSet.has(q.id)) &&
        (!f.test || q.test) &&
        (!needle || fold(`${q.id} ${q.question} ${q.answers.join(' ')}`).includes(needle)),
    )
    // Sổ ôn tập: câu sai gần nhất trước
    if (f.wrong) out.sort((a, b) => review.indexOf(a.id) - review.indexOf(b.id))
    return out
  }, [f, review])

  const allShown = list.length > 0 && list.every((q) => shown.has(q.id))
  const toggle = (id: string) =>
    setShown((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <header>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t.back}
        </button>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t.title}</h1>
        <p className="mt-1 text-lg font-semibold">{fill(t.total, { n: questionList.length })}</p>
        <p className="text-sm text-ink-soft">{t.intro}</p>
      </header>

      <section className="card flex flex-col gap-4" aria-label={t.filterOther}>
        <fieldset>
          <legend className="mb-1 font-semibold">{t.filterDifficulty}</legend>
          <div className="flex flex-wrap gap-2">
            {(['all', ...difficulties] as const).map((d) => (
              <label key={d} className={`seg ${f.difficulty === d ? 'seg-on' : ''}`}>
                <input type="radio" name="bank-difficulty" className="sr-only" checked={f.difficulty === d} onChange={() => set({ difficulty: d })} />
                {d === 'all' ? t.all : d}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5" checked={f.wrong} disabled={review.length === 0 && !f.wrong} onChange={(e) => set({ wrong: e.target.checked })} />
            {fill(t.onlyWrong, { n: review.length })}
          </label>
          {hasTest && (
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5" checked={f.test} onChange={(e) => set({ test: e.target.checked })} />
              {t.onlyTest}
            </label>
          )}
        </div>
        <label className="flex flex-col gap-1 font-semibold">
          {t.search}
          <input type="search" className="input" value={f.text} onChange={(e) => set({ text: e.target.value })} />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto font-semibold" aria-live="polite">
          {fill(t.shown, { n: list.length })}
        </p>
        <button
          type="button"
          className="btn-secondary"
          disabled={list.length === 0}
          onClick={() => setShown(allShown ? new Set() : new Set([...shown, ...list.map((q) => q.id)]))}
        >
          {allShown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />} {allShown ? t.hideAll : t.showAll}
        </button>
        <button type="button" className="btn-primary" disabled={list.length === 0} onClick={() => setPractice(list.map((q) => q.id))}>
          <GraduationCap size={18} aria-hidden="true" /> {fill(t.practice, { n: list.length })}
        </button>
      </div>
      {f.wrong && <p className="-mt-3 text-sm text-ink-soft">{t.practiceHint}</p>}

      {list.length === 0 && <p className="text-ink-soft">{t.none}</p>}
      <ol className="flex flex-col gap-3">
        {list.map((q) => {
          const open = shown.has(q.id)
          return (
            <li key={q.id} className="card flex flex-col gap-2" data-question={q.id}>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono font-semibold">{q.id}</span>
                <span className="rounded-full bg-line px-2.5 py-0.5 font-semibold">{fill(site.game.question.difficulty, { n: q.difficulty })}</span>
                <span className="text-ink-soft">{(t.types as Record<string, string>)[q.type] ?? q.type}</span>
                {q.test && <span className="rounded-full border border-ink-soft px-2 py-0.5 text-ink-soft">{site.testLabel}</span>}
              </div>
              <p className="font-semibold leading-snug">{q.question}</p>
              <ul className="flex flex-col gap-1">
                {q.answers.map((a, i) => {
                  const right = open && i === q.correct
                  return (
                    <li key={i} className={`flex items-start gap-2 rounded-xl px-2 py-1 ${right ? 'bg-ok/10 font-semibold' : ''}`}>
                      <span className="font-bold" aria-hidden="true">
                        {LETTERS[i]}.
                      </span>
                      <span className="flex-1">{a}</span>
                      {right && (
                        <span className="flex items-center gap-1 text-sm font-bold text-ok">
                          <Check size={16} aria-hidden="true" /> {site.game.question.correctAnswer}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button type="button" className="btn-secondary" aria-expanded={open} onClick={() => toggle(q.id)}>
                  {open ? t.hideAnswer : t.showAnswer}
                </button>
              </div>
            </li>
          )
        })}
      </ol>
      {review.length > 0 && (
        <button
          type="button"
          className="btn-link self-start"
          onClick={() => {
            clearReview()
            setReview([])
            set({ wrong: false })
          }}
        >
          {t.clearWrong}
        </button>
      )}
      {practice && (
        <Practice
          ids={practice}
          onClose={() => setPractice(null)}
          onCorrect={(id) => setReview(removeFromReview(id))}
        />
      )}
    </main>
  )
}
