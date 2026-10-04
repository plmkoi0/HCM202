// Một kết nối WebSocket (mục 15.4) — dùng chung cho server Node cục bộ (`ws`) và Vercel
// (`experimental_upgradeWebSocket` trả về đúng đối tượng WebSocket của gói `ws`).
//
// Giao thức (JSON):
//   máy → server: {t:"hello", code, playerId, token}   {t:"ping", at}
//   server → máy: {t:"state", ...StateView}   {t:"pong", at, serverNow}   {t:"error", error, message}
//                 {t:"bye", reason}  (bị mời ra / phòng đóng)
// Hành động vẫn gửi qua HTTP POST — WebSocket chỉ đẩy trạng thái xuống.

import type { WebSocket } from 'ws'
import { newLinkId } from './auth.js'
import { RoomError, errorMessage } from './errors.js'
import type { Hub, HubClient } from './hub.js'
import type { RoomService } from './rooms.js'
import type { Room } from './types.js'

export const SOCKET_MAX_PAYLOAD = 16 * 1024
const HELLO_TIMEOUT_MS = 10_000
/** không nhận tin nào trong chừng này thì cắt (bộ nhớ instance, không ghi Redis) */
const IDLE_MS = 70_000

export interface SocketContext {
  service: RoomService
  hub: Hub
}

export interface SocketOptions {
  /** đóng kết nối sau chừng này (server cục bộ giả lập giới hạn 300 s của Vercel Hobby) */
  maxLifeMs?: number
  /** địa chỉ IP của máy (giới hạn tần suất theo IP) */
  ip?: string
}

export function attachSocket(ws: WebSocket, ctx: SocketContext, opts: SocketOptions = {}): void {
  let client: (HubClient & { code: string; linkId: string; sent: number }) | null = null
  let closed = false
  /** đã nhận hello, đang mở — bỏ qua hello đến sau */
  let opening = false
  /** lần nhận tin gần nhất — client ping 25 s/lần; im quá lâu = kết nối nửa mở (máy mất mạng không báo) */
  let lastMsg = Date.now()
  const timers: ReturnType<typeof setTimeout>[] = []

  const send = (msg: unknown) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg))
  }
  const fail = (code: string, closeCode = 4003) => {
    send({ t: 'error', error: code, message: errorMessage(code) })
    ws.close(closeCode, code)
  }

  timers.push(setTimeout(() => !client && fail('UNAUTHORIZED', 4001), HELLO_TIMEOUT_MS))
  if (opts.maxLifeMs) timers.push(setTimeout(() => ws.close(4000, 'max-life'), opts.maxLifeMs))
  timers.push(
    setInterval(() => {
      if (Date.now() - lastMsg > IDLE_MS) ws.terminate()
    }, 15_000) as unknown as ReturnType<typeof setTimeout>,
  )

  const push = (room: Room) => {
    if (!client || room.version <= client.sent) return
    const me = room.members.find((m) => m.id === client!.playerId)
    if (!me) {
      send({ t: 'bye', reason: room.kicked.includes(client.playerId) ? 'KICKED' : 'LEFT' })
      ws.close(4004, 'gone')
      return
    }
    client.sent = room.version
    send({ t: 'state', ...ctx.service.view(room, client.playerId) })
  }

  ws.on('message', (raw) => {
    lastMsg = Date.now()
    void (async () => {
      let msg: Record<string, unknown>
      try {
        const text = String(raw)
        if (text.length > SOCKET_MAX_PAYLOAD) return fail('BAD_REQUEST', 1009)
        msg = JSON.parse(text) as Record<string, unknown>
      } catch {
        return fail('BAD_REQUEST', 4002)
      }
      if (msg.t === 'ping') {
        send({ t: 'pong', at: msg.at, serverNow: ctx.service.now() })
        return
      }
      if (msg.t !== 'hello' || client || opening) return
      opening = true
      const linkId = newLinkId()
      const cred = { code: String(msg.code ?? ''), playerId: String(msg.playerId ?? ''), token: String(msg.token ?? '') }
      try {
        const room = await ctx.service.linkOpen(cred, linkId, opts.ip)
        if (closed) {
          // máy đóng kết nối trong lúc đang mở → ghi nhận đóng luôn
          void ctx.service.linkClose(room.code, cred.playerId, linkId)
          return
        }
        client = { playerId: cred.playerId, code: room.code, linkId, sent: 0, push }
        ctx.hub.add(room.code, client)
        push(room)
      } catch (e) {
        if (e instanceof RoomError) fail(e.code)
        else {
          console.error('[socket] lỗi khi mở kết nối', e)
          fail('BUSY', 1011)
        }
      }
    })()
  })

  ws.on('close', () => {
    closed = true
    for (const t of timers) clearTimeout(t)
    if (!client) return
    ctx.hub.remove(client.code, client)
    void ctx.service.linkClose(client.code, client.playerId, client.linkId)
    client = null
  })
  ws.on('error', () => {
    // lỗi mạng: sự kiện close sẽ theo sau
  })
}
