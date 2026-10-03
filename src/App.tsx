import { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { clearSave, loadLastSeen, loadSave, newLocalGame, resumeLocal, type LocalSave, type LocalSetup as Setup } from './game/local'
import { gameData } from './lib/gameData'
import { Home } from './screens/Home'
import { LocalGame } from './screens/LocalGame'
import { LocalSetup } from './screens/LocalSetup'

type Screen = { name: 'home' } | { name: 'setup' } | { name: 'game'; save: LocalSave; key: number }

function randomSeed(): number {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0]
  } catch {
    return Math.floor(Math.random() * 2 ** 32)
  }
}

export default function App() {
  const [screen, setScreenState] = useState<Screen>({ name: 'home' })
  // đổi màn → về đầu trang (vd. từ thiết lập dài sang bàn cờ trên điện thoại)
  const setScreen = (next: Screen) => {
    setScreenState(next)
    window.scrollTo(0, 0)
  }
  const saved = screen.name === 'home' ? loadSave(gameData) : null
  const canResume = !!saved && saved.present.phase !== 'ended'

  const start = (setup: Setup) => setScreen({ name: 'game', save: newLocalGame(gameData, setup, Date.now(), randomSeed()), key: Date.now() })
  const home = () => setScreen({ name: 'home' })

  let view
  switch (screen.name) {
    case 'home':
      view = (
        <Home
          canResume={canResume}
          onLocal={() => setScreen({ name: 'setup' })}
          onResume={() => saved && setScreen({ name: 'game', save: resumeLocal(saved, Date.now(), loadLastSeen()), key: Date.now() })}
        />
      )
      break
    case 'setup':
      view = <LocalSetup onStart={start} onBack={home} />
      break
    case 'game':
      view = <LocalGame key={screen.key} initial={screen.save} onHome={home} onAgain={start} />
      break
  }
  return (
    <ErrorBoundary
      onReset={() => {
        clearSave()
        home()
      }}
    >
      {view}
    </ErrorBoundary>
  )
}
