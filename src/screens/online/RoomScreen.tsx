// Một phòng: nối server, hiện phòng chờ / ván / kết thúc theo trạng thái; hộp xác nhận rời phòng,
// cảnh báo đóng tab giữa ván, thông báo khi trở thành chủ phòng, phiên kết thúc (bị mời ra…).
import { useEffect, useRef, useState } from 'react'
import type { StateView } from '../../../server/types'
import { Sheet } from '../../components/Sheet'
import { site } from '../../lib/gameData'
import type { Session } from '../../net/api'
import { clearSession } from '../../online/session'
import { useRoom } from '../../online/useRoom'
import { Lobby } from './Lobby'
import { ConnectionBadge, OnlineGame } from './OnlineGame'

export function RoomScreen({ session, initial, onHome }: { session: Session; initial?: StateView; onHome: () => void }) {
  const t = site.online
  const { view, mode, ended, act, conn } = useRoom(session, initial)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const wasHost = useRef<boolean | null>(null)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])

  const isHost = view ? view.room.hostId === view.you : false
  useEffect(() => {
    if (!view) return
    if (wasHost.current === false && isHost) setToast(t.becameHost)
    wasHost.current = isHost
  }, [isHost, view, t.becameHost])

  // đổi trạng thái phòng (tạo phòng xong → phòng chờ, bắt đầu, kết thúc): cuộn về đầu để thấy ngay
  // mã phòng + QR trên điện thoại (màn trước có thể đang cuộn ở nút "Tạo phòng" cuối form)
  const status = view?.room.status
  useEffect(() => {
    if (status) window.scrollTo(0, 0)
  }, [status])

  const playing = view?.room.status === 'playing'
  useEffect(() => {
    if (!playing) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = site.game.leaveWarning
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [playing])

  useEffect(() => {
    if (ended) clearSession()
  }, [ended])

  const leave = async () => {
    setConfirmLeave(false)
    await act({ type: 'LEAVE' })
    clearSession()
    onHome()
  }

  if (ended || view?.room.status === 'closed') {
    const reason = ended ?? 'ROOM_CLOSED'
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-10 text-center">
        <p className="text-lg font-semibold" role="alert">
          {(t.ended as Record<string, string>)[reason] ?? (site.errors as Record<string, string>)[reason] ?? reason}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            clearSession()
            onHome()
          }}
        >
          {t.back}
        </button>
      </main>
    )
  }
  if (!view) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-10">
        <ConnectionBadge mode={mode} />
      </main>
    )
  }
  return (
    <div data-room-version={view.version} data-room-status={view.room.status}>
      {view.room.status === 'lobby' ? (
        <>
          <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pt-3">
            <ConnectionBadge mode={mode} />
          </div>
          <Lobby view={view} act={act} onLeave={() => setConfirmLeave(true)} report={setToast} />
        </>
      ) : (
        <OnlineGame view={view} offset={conn.api.clock.offset} mode={mode} act={act} onLeave={() => setConfirmLeave(true)} report={setToast} />
      )}
      {confirmLeave && (
        <Sheet title={t.leave} labelledBy="leave-title" onClose={() => setConfirmLeave(false)}>
          <p className="mb-4">{t.leaveConfirm}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1" onClick={() => void leave()}>
              {t.leave}
            </button>
            <button type="button" className="btn-secondary flex-1" onClick={() => setConfirmLeave(false)} data-autofocus>
              {site.game.quitNo}
            </button>
          </div>
        </Sheet>
      )}
      <div role="status" className={toast ? 'fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl bg-ink px-4 py-3 text-center text-bg shadow-xl' : 'sr-only'}>
        {toast}
      </div>
    </div>
  )
}
