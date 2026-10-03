import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { clearSave, loadLastSeen, loadSave, newLocalGame, resumeLocal, type LocalSave, type LocalSetup as Setup } from './game/local'
import { gameData } from './lib/gameData'
import { Home } from './screens/Home'
import { LocalGame } from './screens/LocalGame'
import { LocalSetup } from './screens/LocalSetup'
import { codeFromPath, loadSession } from './online/session'
import type { OnlineStart } from './screens/online/OnlineApp'

// Chơi qua phòng chỉ có ở bản online: bản offline (__OFFLINE__ = true) bỏ hẳn nhánh này khi build,
// nên không có mã mạng nào trong file offline (scripts/check-offline.mjs kiểm).
const OnlineApp = __OFFLINE__ ? null : lazy(() => import('./screens/online/OnlineApp'))

type Screen = { name: 'home' } | { name: 'setup' } | { name: 'game'; save: LocalSave; key: number } | { name: 'online'; start: OnlineStart; key: number }

/** Mở bằng link /p/ABCDE: có phiên của phòng đó thì vào lại, không thì màn Vào phòng điền sẵn mã */
function initialScreen(): Screen {
  if (__OFFLINE__) return { name: 'home' }
  const code = codeFromPath(location.pathname)
  if (!code) return { name: 'home' }
  const s = loadSession()
  if (s && s.code === code) return { name: 'online', start: { kind: 'room', session: s }, key: 0 }
  return { name: 'online', start: { kind: 'join', code }, key: 0 }
}

function randomSeed(): number {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0]
  } catch {
    return Math.floor(Math.random() * 2 ** 32)
  }
}

export default function App() {
  const [screen, setScreenState] = useState<Screen>(initialScreen)
  // đổi màn → về đầu trang (vd. từ thiết lập dài sang bàn cờ trên điện thoại)
  const setScreen = (next: Screen) => {
    setScreenState(next)
    window.scrollTo(0, 0)
  }
  const saved = screen.name === 'home' ? loadSave(gameData) : null
  const canResume = !!saved && saved.present.phase !== 'ended'

  const start = (setup: Setup) => setScreen({ name: 'game', save: newLocalGame(gameData, setup, Date.now(), randomSeed()), key: Date.now() })
  const home = () => setScreen({ name: 'home' })
  const online = (st: OnlineStart) => setScreen({ name: 'online', start: st, key: Date.now() })
  const lastRoom = !__OFFLINE__ && screen.name === 'home' ? loadSession() : null

  let view
  switch (screen.name) {
    case 'home':
      view = (
        <Home
          canResume={canResume}
          onLocal={() => setScreen({ name: 'setup' })}
          onResume={() => saved && setScreen({ name: 'game', save: resumeLocal(saved, Date.now(), loadLastSeen()), key: Date.now() })}
          online={
            OnlineApp
              ? {
                  onCreate: () => online({ kind: 'create' }),
                  onJoin: () => online({ kind: 'join' }),
                  onResumeRoom: lastRoom ? () => online({ kind: 'room', session: lastRoom }) : undefined,
                }
              : undefined
          }
        />
      )
      break
    case 'setup':
      view = <LocalSetup onStart={start} onBack={home} />
      break
    case 'game':
      view = <LocalGame key={screen.key} initial={screen.save} onHome={home} onAgain={start} />
      break
    case 'online':
      view = OnlineApp ? (
        <Suspense fallback={null}>
          <OnlineApp key={screen.key} start={screen.start} onHome={home} />
        </Suspense>
      ) : null
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
