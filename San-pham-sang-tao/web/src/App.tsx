import Bridge from './components/Bridge'
import Hero from './components/Hero'
import Intro from './components/Intro'
import ArtifactViewerProvider from './components/Museum/ArtifactViewerProvider'
import Museum from './components/Museum/Museum'
import Nav from './components/Nav'
import Placeholder from './components/Placeholder'
import Quiz from './components/Quiz/Quiz'
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
        <Placeholder id="nguon" title="Nguồn tham khảo" stage="giai đoạn M4" />
        <Placeholder id="nhom" title="Nhóm thực hiện" stage="giai đoạn M4" />
      </main>
      <footer className="border-t border-line px-4 py-8 text-center text-sm text-ink-soft">
        <p className="font-serif font-semibold text-ink">{site.name}</p>
        <p className="mx-auto mt-1 max-w-xl">{site.footer}</p>
      </footer>
    </div>
    </ArtifactViewerProvider>
  )
}
