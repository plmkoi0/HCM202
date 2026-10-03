// Trang chủ (mục 12.1). Bản offline chỉ có "Chơi trên một máy" (mục 15.6).
import { DoorOpen, Dices, Play, PlusCircle, RotateCcw } from 'lucide-react'
import { hasTestQuestions, questionList, site } from '../lib/gameData'

export interface OnlineEntry {
  onCreate: () => void
  onJoin: () => void
  /** có phiên phòng gần nhất trên máy */
  onResumeRoom?: () => void
}

export function Home({ canResume, onLocal, onResume, online }: { canResume: boolean; onLocal: () => void; onResume: () => void; online?: OnlineEntry }) {
  const t = site.home
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-8">
      {hasTestQuestions && (
        <p role="status" className="rounded-xl bg-gold px-4 py-2 text-center font-semibold text-on-gold">
          {site.testBanner}
        </p>
      )}
      <header className="flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold text-accent-text">{site.course}</p>
        <h1 className="font-serif text-4xl font-bold leading-tight">{site.title}</h1>
        <p className="text-ink-soft">{site.subtitle}</p>
        <p className="mt-1 font-serif text-lg italic">“{site.message}”</p>
      </header>
      <p className="text-center">{t.tagline}</p>
      <nav className="flex flex-col gap-3" aria-label={site.title}>
        {online?.onResumeRoom && (
          <button type="button" className="btn-primary btn-big" onClick={online.onResumeRoom}>
            <RotateCcw size={22} aria-hidden="true" /> {t.resumeRoom}
          </button>
        )}
        {online && (
          <>
            <button type="button" className={`${online.onResumeRoom ? 'btn-secondary' : 'btn-primary'} btn-big`} onClick={online.onCreate}>
              <PlusCircle size={22} aria-hidden="true" /> {t.createRoom}
            </button>
            <button type="button" className="btn-secondary btn-big" onClick={online.onJoin}>
              <DoorOpen size={22} aria-hidden="true" /> {t.joinRoom}
            </button>
          </>
        )}
        {canResume && (
          <button type="button" className="btn-primary btn-big" onClick={onResume}>
            <Play size={22} aria-hidden="true" /> {t.resumeLocal}
          </button>
        )}
        <button type="button" className={`${canResume || online ? 'btn-secondary' : 'btn-primary'} btn-big`} onClick={onLocal}>
          <Dices size={22} aria-hidden="true" /> {t.localPlay}
        </button>
      </nav>
      <p className="text-center text-sm text-ink-soft">{__OFFLINE__ ? t.offlineNote : t.building}</p>
      <p className="text-center text-xs text-ink-soft">
        {t.questionBank}: {questionList.length}
      </p>
    </main>
  )
}
