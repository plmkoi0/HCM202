// Nối một phòng: giữ trạng thái mới nhất, chế độ kết nối, lý do kết thúc phiên.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClientAction, StateView } from '../../server/types'
import { Api, type Session } from '../net/api'
import { RoomConnection, type ConnectionMode } from '../net/connection'

export const api = new Api('')

export function useRoom(session: Session, initial?: StateView) {
  const [view, setView] = useState<StateView | null>(initial ?? null)
  const [mode, setMode] = useState<ConnectionMode>('connecting')
  const [ended, setEnded] = useState<string | null>(null)
  const initialRef = useRef(initial)
  const conn = useMemo(() => new RoomConnection({ api, session, onState: setView, onMode: setMode, onEnd: setEnded }), [session])
  useEffect(() => {
    conn.start(initialRef.current)
    if (!initialRef.current) void conn.pollOnce()
    return () => conn.stop()
  }, [conn])
  const act = (a: ClientAction) => conn.act(a)
  return { view, mode, ended, act, conn }
}
