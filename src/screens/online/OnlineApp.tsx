// Phần chơi qua phòng (chỉ bản online — bản offline không nạp file này, xem App.tsx).
import { useState } from 'react'
import type { StateView } from '../../../server/types'
import type { Session } from '../../net/api'
import { storeSession } from '../../online/session'
import { CreateRoom } from './CreateRoom'
import { JoinRoom } from './JoinRoom'
import { RoomScreen } from './RoomScreen'

export type OnlineStart = { kind: 'create' } | { kind: 'join'; code?: string } | { kind: 'room'; session: Session }

export default function OnlineApp({ start, onHome }: { start: OnlineStart; onHome: () => void }) {
  const [room, setRoom] = useState<{ session: Session; initial?: StateView } | null>(start.kind === 'room' ? { session: start.session } : null)
  const enter = (session: Session, initial: StateView) => {
    storeSession(session)
    history.replaceState(null, '', `/p/${session.code}`)
    setRoom({ session, initial })
  }
  const home = () => {
    history.replaceState(null, '', '/')
    onHome()
  }
  if (room) return <RoomScreen key={room.session.code + room.session.playerId} session={room.session} initial={room.initial} onHome={home} />
  if (start.kind === 'create') return <CreateRoom onEnter={enter} onBack={home} />
  return <JoinRoom initialCode={start.kind === 'join' ? start.code : undefined} onEnter={enter} onBack={home} />
}
