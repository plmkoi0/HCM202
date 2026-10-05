// Dọn kết nối WebSocket sau khi đóng phải được nền tảng chờ (Vercel waitUntil — rà soát 05/10/2026)
import { EventEmitter } from 'node:events'
import { describe, expect, it } from 'vitest'
import type { Hub } from '../server/hub'
import type { RoomService } from '../server/rooms'
import { attachSocket } from '../server/socket'
import type { Room } from '../server/types'

class FakeWs extends EventEmitter {
  OPEN = 1
  readyState = 1
  sent: string[] = []
  send(s: string) {
    this.sent.push(s)
  }
  close() {
    this.readyState = 3
    this.emit('close')
  }
  terminate() {
    this.close()
  }
}

describe('WebSocket đóng → dọn kết nối chạy trong waitUntil', () => {
  it('linkClose được giao cho waitUntil và chạy xong', async () => {
    const room = { code: 'ABCDE', version: 1, members: [{ id: 'p1' }], kicked: [] } as unknown as Room
    let closedLink: string | null = null
    let finish!: () => void
    const service = {
      now: () => Date.now(),
      linkOpen: async () => room,
      // ghi Redis mất một lúc
      linkClose: (_code: string, _pid: string, linkId: string) =>
        new Promise<void>((ok) => {
          finish = () => {
            closedLink = linkId
            ok()
          }
        }),
      view: () => ({}),
    } as unknown as RoomService
    const hub = { add() {}, remove() {} } as unknown as Hub
    const waited: Promise<unknown>[] = []
    const ws = new FakeWs()
    attachSocket(ws as never, { service, hub }, { waitUntil: (p) => void waited.push(p) })
    ws.emit('message', JSON.stringify({ t: 'hello', code: 'ABCDE', playerId: 'p1', token: 'x' }))
    await new Promise((r) => setTimeout(r, 10))
    ws.close()
    expect(waited).toHaveLength(1)
    let settled = false
    void waited[0].then(() => (settled = true))
    await new Promise((r) => setTimeout(r, 10))
    expect(settled).toBe(false)
    finish()
    await waited[0]
    expect(settled).toBe(true)
    expect(closedLink).not.toBeNull()
  })

  it('lỗi khi dọn không lọt ra ngoài (promise giao cho waitUntil không bị từ chối)', async () => {
    const room = { code: 'ABCDE', version: 1, members: [{ id: 'p1' }], kicked: [] } as unknown as Room
    const service = {
      now: () => Date.now(),
      linkOpen: async () => room,
      linkClose: async () => {
        throw new Error('Redis lỗi')
      },
      view: () => ({}),
    } as unknown as RoomService
    const waited: Promise<unknown>[] = []
    const ws = new FakeWs()
    attachSocket(ws as never, { service, hub: { add() {}, remove() {} } as unknown as Hub }, { waitUntil: (p) => void waited.push(p) })
    ws.emit('message', JSON.stringify({ t: 'hello', code: 'ABCDE', playerId: 'p1', token: 'x' }))
    await new Promise((r) => setTimeout(r, 10))
    ws.close()
    await expect(waited[0]).resolves.toBeUndefined()
  })
})
