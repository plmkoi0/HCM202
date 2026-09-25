import Bridge from './components/Bridge'
import Hero from './components/Hero'
import Intro from './components/Intro'
import MindMap from './components/MindMap'
import ArtifactViewerProvider from './components/Museum/ArtifactViewerProvider'
import Museum from './components/Museum/Museum'
import Nav from './components/Nav'
import Quiz from './components/Quiz/Quiz'
import Sources from './components/Sources'
import Team from './components/Team'
import { team } from './lib/data'
import { OFFLINE } from './lib/offline'
import { onlineUrl } from './lib/share'
import { site } from './lib/site'

export default function App() {
  return (
    <ArtifactViewerProvider>
      <div className="paper-texture min-h-screen">
        <a
          href="#bao-tang"
          className="sr-only z-50 bg-ink px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Bỏ qua tới Bảo tàng
        </a>
        <Nav />
        <main>
          <Hero />
          <Intro />
          <Museum />
          <Bridge />
          <Quiz />
          <MindMap />
          <Sources />
          {team.members.length > 0 && <Team />}
        </main>
        <footer className="border-t border-line px-4 py-8 text-center text-sm text-ink-soft">
          <p className="font-serif font-semibold text-ink">{site.name}</p>
          <p className="mx-auto mt-1 max-w-xl">{site.footer}</p>
          {OFFLINE && <OfflineNote />}
        </footer>
      </div>
    </ArtifactViewerProvider>
  )
}

/** Dòng nhỏ ở chân trang bản offline, trỏ về bản online (site.json → siteUrl). */
function OfflineNote() {
  const url = onlineUrl()
  return (
    <p className="mt-3 text-xs">
      {site.offline.note}{' '}
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          {url}
        </a>
      ) : (
        'TODO'
      )}
    </p>
  )
}
