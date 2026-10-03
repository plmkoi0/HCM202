import { hasTestQuestions, questionList, site } from './lib/gameData'

// G1: khung tối thiểu để build được; giao diện bàn cờ làm ở G2 (mục 18).
export default function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 py-10">
      {hasTestQuestions && (
        <p role="status" className="rounded-lg bg-gold px-4 py-2 text-center font-semibold text-ink">
          {site.testBanner}
        </p>
      )}
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-accent">{site.course}</p>
        <h1 className="font-serif text-4xl font-bold">{site.title}</h1>
        <p className="text-ink-soft">{site.subtitle}</p>
      </header>
      <p className="rounded-xl border border-line bg-surface p-4">{site.home.building}</p>
      <p className="text-sm text-ink-soft">
        {site.home.questionBank}: {questionList.length}
      </p>
      <p className="font-serif text-xl italic">“{site.message}”</p>
    </main>
  )
}
