// Server qua mạng thật (HTTP + WebSocket trên cổng cục bộ) với client dùng chung cho giao diện
// (src/net): WebSocket và polling cho cùng kết quả; WebSocket bị đóng (giới hạn 300 s của
// Vercel, thu nhỏ) → client tự nối lại, câu trả lời không mất (mục 17 — Tải và ngắt kết nối).
import { afterEach, describe, expect, it } from 'vitest'
import { createContext } from '../server/context'
import { MemoryStore } from '../server/memoryStore'
import { startLocalServer, type LocalServer } from '../server/node'
import { serverData } from '../server/data'
import type { StateView } from '../server/types'
import { Api } from '../src/net/api'
import { RoomConnection, type ConnectionOptions } from '../src/net/connection'
import { autoPlay, fastData, waitFor } from './netHelpers'

const data = fastData(serverData)
const strip = (v: StateView) => ({ ...v, serverNow: 0, you: '' })
let servers: LocalServer[] = []
let conns: RoomConnection[] = []

afterEach(async () => {
  for (const c of conns) c.stop()
  conns = []
  for (const s of servers) await s.close()
  servers = []
})

async function server(opts: { socketMaxLifeMs?: number } = {}) {
  const ctx = createContext(new MemoryStore(), { data })
  const s = await startLocalServer({ ctx, socketMaxLifeMs: opts.socketMaxLifeMs ?? 0 })
  servers.push(s)
  return { s, ctx }
}

function connect(base: string, session: { code: string; playerId: string; token: string }, initial: StateView, o: Partial<ConnectionOptions> = {}) {
  const api = new Api(base)
  const modes: string[] = []
  const c = new RoomConnection({ api, session, onState: () => {}, onMode: (m) => modes.push(m), ...o })
  c.start(initial)
  conns.push(c)
  return { c, modes, api }
}

describe('Server qua mạng', () => {
  it('health, tạo / vào phòng qua HTTP; WebSocket và polling cho cùng trạng thái', async () => {
    const { s } = await server()
    const api = new Api(s.url)
    expect(await api.health()).toMatchObject({ ok: true, store: 'memory' })
    const host = await api.create({ name: 'Lan', color: 0, capacity: 3 })
    const guest = await api.join(host.code, { name: 'Minh', color: 1 })
    const ws = connect(s.url, host, host.state)
    const poll = connect(s.url, guest, guest.state, { WebSocketImpl: null })
    await waitFor(() => ws.c.mode === 'ws', 5000, 'WebSocket')
    expect(poll.c.mode).toBe('poll')
    expect((await ws.c.act({ type: 'ADD_BOT' })).ok).toBe(true)
    expect((await ws.c.act({ type: 'START' })).ok).toBe(true)
    const a = autoPlay(ws.c, host.playerId, data)
    const b = autoPlay(poll.c, guest.playerId, data)
    await waitFor(() => ws.c.view?.room.status === 'ended' && poll.c.view?.room.status === 'ended', 30_000, 'ván kết thúc')
    a.stop()
    b.stop()
    await waitFor(() => ws.c.view!.version === poll.c.view!.version, 5000, 'cùng version')
    // cùng một ván, cùng kết quả (trừ phần riêng của mỗi người xem)
    expect(strip(ws.c.view!)).toEqual(strip(poll.c.view!))
    expect(ws.c.view!.game!.ended).not.toBeNull()
    expect(ws.modes).toContain('ws')
    expect(poll.modes).not.toContain('ws')
  }, 40_000)

  it('thay kết nối WebSocket trước khi server đóng (giới hạn thời gian sống) — không bị tính mất kết nối', async () => {
    const { s, ctx } = await server({ socketMaxLifeMs: 900 })
    const api = new Api(s.url)
    const host = await api.create({ name: 'Lan', color: 0, capacity: 2 })
    const ws = connect(s.url, host, host.state, { renewAfterMs: 400, renewHardMs: 600 })
    await waitFor(() => ws.c.mode === 'ws', 5000, 'WebSocket')
    await new Promise((r) => setTimeout(r, 2500))
    expect(ws.c.mode).toBe('ws')
    expect(ws.modes).not.toContain('poll')
    const room = (await ctx.service.store.get(host.code))!
    expect(room.members[0]!.connected).toBe(true)
    expect(Object.keys(room.members[0]!.links).length).toBe(1)
  }, 15_000)

  it('WebSocket bị đóng đột ngột giữa lúc trả lời → chuyển polling, nối lại, câu trả lời không mất', async () => {
    const { s } = await server({ socketMaxLifeMs: 0 })
    const api = new Api(s.url)
    const host = await api.create({ name: 'Lan', color: 0, capacity: 1 })
    const ws = connect(s.url, host, host.state, { autoTick: false })
    await waitFor(() => ws.c.mode === 'ws', 5000, 'WebSocket')
    // tới pha câu hỏi của mình
    for (let i = 0; i < 200; i++) {
      const g = ws.c.view!.game!
      if (g.phase === 'question') break
      if (g.phase === 'roll') await ws.c.act({ type: 'ROLL' })
      else if (g.phase === 'reveal') await ws.c.act({ type: 'NEXT_TURN' })
      else if (g.phase === 'chooseHorse') await ws.c.act({ type: 'CHOOSE_HORSE', horse: 0 })
      else if (g.phase === 'discard') await ws.c.act({ type: 'DISCARD_POWERUP', discard: 'new' })
      await new Promise((r) => setTimeout(r, 5))
    }
    expect(ws.c.view!.game!.phase).toBe('question')
    const before = ws.c.view!.version
    // server cắt mọi kết nối WebSocket ngay lúc gửi câu trả lời
    expect(s.dropSockets()).toBe(1)
    const q = ws.c.view!.game!.turn.question!
    const r = await ws.c.act({ type: 'ANSWER', choice: q.order[0]! })
    expect(r.ok).toBe(true)
    await waitFor(() => ws.c.view!.version > before && ws.c.view!.game!.turn.outcome?.kind === 'answered', 5000, 'kết quả câu trả lời')
    await waitFor(() => ws.c.mode === 'ws', 8000, 'nối lại WebSocket')
    expect(ws.modes).toContain('poll')
  }, 20_000)

  it('phiên không hợp lệ / bị mời ra → dừng kết nối, báo lý do', async () => {
    const { s } = await server()
    const api = new Api(s.url)
    const host = await api.create({ name: 'Lan', color: 0, capacity: 3 })
    const guest = await api.join(host.code, { name: 'Minh', color: 1 })
    let ended = ''
    const g = connect(s.url, guest, guest.state, { onEnd: (r) => (ended = r) })
    await waitFor(() => g.c.mode === 'ws', 5000, 'WebSocket')
    const h = connect(s.url, host, host.state)
    expect((await h.c.act({ type: 'KICK', playerId: guest.playerId })).ok).toBe(true)
    await waitFor(() => ended !== '', 5000, 'bị mời ra')
    expect(ended).toBe('KICKED')
    expect(g.c.mode).toBe('closed')
    let bad = ''
    connect(s.url, { ...host, token: 'sai' }, host.state, { onEnd: (r) => (bad = r) })
    await waitFor(() => bad !== '', 5000, 'token sai')
    expect(bad).toBe('UNAUTHORIZED')
  }, 15_000)
})
