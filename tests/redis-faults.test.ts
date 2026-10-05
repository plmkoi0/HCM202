// Lỗi kết nối Redis (rà soát 05/10/2026): proxy TCP chen giữa redis-server cục bộ để làm chậm
// hoặc từ chối kết nối, giống Upstash chập chờn. Không có redis-server thì bỏ qua.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { connect, createServer, type Server, type Socket } from 'node:net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Hub } from '../server/hub'
import { RedisStore } from '../server/redisStore'
import type { RoomService } from '../server/rooms'
import type { RoomStore } from '../server/store'
import type { Room } from '../server/types'

const hasRedis = spawnSync('redis-server', ['--version']).status === 0
let redisProc: ChildProcess | null = null
let redisPort = 0

function freePort(): Promise<number> {
  return new Promise((ok) => {
    const s = createServer()
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as { port: number }).port
      s.close(() => ok(p))
    })
  })
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** proxy: 'pass' chuyển thẳng; 'hold' giữ dữ liệu từ client trong holdMs đầu của mỗi kết nối; 'refuse' đóng ngay */
class FaultProxy {
  mode: 'pass' | 'hold' | 'refuse' = 'pass'
  holdMs = 0
  private server: Server
  private sockets = new Set<Socket>()
  port = 0
  constructor() {
    this.server = createServer((sock) => {
      if (this.mode === 'refuse') return void sock.destroy()
      const up = connect(redisPort, '127.0.0.1')
      this.sockets.add(sock).add(up)
      let hold = this.mode === 'hold'
      const buf: Buffer[] = []
      sock.on('data', (d) => (hold ? buf.push(d) : up.write(d)))
      if (hold)
        setTimeout(() => {
          hold = false
          for (const b of buf) up.write(b)
        }, this.holdMs)
      up.on('data', (d) => sock.write(d))
      const end = () => {
        sock.destroy()
        up.destroy()
      }
      sock.on('error', end).on('close', end)
      up.on('error', end).on('close', end)
    })
  }
  listen(): Promise<void> {
    return new Promise((ok) => this.server.listen(0, '127.0.0.1', () => ((this.port = (this.server.address() as { port: number }).port), ok())))
  }
  close(): void {
    for (const s of this.sockets) s.destroy()
    this.server.close()
  }
}

beforeAll(async () => {
  if (!hasRedis) return
  redisPort = await freePort()
  redisProc = spawn('redis-server', ['--port', String(redisPort), '--save', '', '--appendonly', 'no', '--bind', '127.0.0.1'], { stdio: 'ignore' })
  for (let i = 0; i < 50; i++) {
    const s = new RedisStore(`redis://127.0.0.1:${redisPort}`)
    try {
      await s.ping()
      await s.close()
      return
    } catch {
      await s.close().catch(() => {})
      await sleep(100)
    }
  }
  throw new Error('redis-server không khởi động được')
})
afterAll(() => {
  redisProc?.kill('SIGKILL')
})

let n = 0
function room(): Room {
  n += 1
  return { schema: 2, code: `F${n}-${process.pid}`, version: 1, createdAt: Date.now(), expiresAt: Date.now() + 3600_000, status: 'lobby', capacity: 2, hostId: 'p1', config: {}, members: [], round: 0, game: null } as unknown as Room
}

describe.skipIf(!hasRedis)('Redis chập chờn', () => {
  it('kết nối lần đầu chậm hơn hạn chờ: lượt gọi đó báo lỗi, lượt sau dùng lại kết nối (không "Socket already opened")', async () => {
    const proxy = new FaultProxy()
    await proxy.listen()
    proxy.mode = 'hold'
    proxy.holdMs = 600
    const store = new RedisStore(`redis://127.0.0.1:${proxy.port}`, { timeoutMs: 200 })
    try {
      await expect(store.ping()).rejects.toThrow(/không trả lời/)
      await sleep(800)
      await expect(store.ping()).resolves.toBeTypeOf('number')
      // ghi / đọc chạy bình thường
      const r = room()
      expect(await store.put(r, 0, 60_000)).toBe(true)
      expect((await store.get(r.code))?.code).toBe(r.code)
    } finally {
      await store.close()
      proxy.close()
    }
  })

  it('theo dõi phòng lỗi thì lần sau theo dõi lại thật (không giữ tập listener rỗng)', async () => {
    const proxy = new FaultProxy()
    await proxy.listen()
    proxy.mode = 'refuse'
    const store = new RedisStore(`redis://127.0.0.1:${proxy.port}`, { timeoutMs: 3000 })
    try {
      const r = room()
      await expect(store.subscribe(r.code, () => {})).rejects.toThrow(/kết nối|Socket/)
      proxy.mode = 'pass'
      const got: Room[] = []
      const unsub = await store.subscribe(r.code, (x) => got.push(x))
      expect(await store.put(r, 0, 60_000)).toBe(true)
      for (let i = 0; i < 50 && got.length === 0; i++) await sleep(20)
      expect(got.map((x) => x.code)).toEqual([r.code])
      await unsub()
    } finally {
      await store.close()
      proxy.close()
    }
  })
})

describe('Hub: theo dõi phòng lỗi thì thử lại', () => {
  it('lần đầu lỗi, lần thử lại sau ~1 s thành công và nhận tin', async () => {
    let calls = 0
    const listeners: ((room: Room) => void)[] = []
    const store = {
      kind: 'memory',
      async subscribe(_code: string, l: (room: Room) => void) {
        calls += 1
        if (calls === 1) throw new Error('mất kết nối pub/sub')
        listeners.push(l)
        return async () => {}
      },
      async get() {
        return null
      },
    } as unknown as RoomStore
    const service = { store, remember() {}, onWrite: undefined } as unknown as RoomService
    const hub = new Hub(service)
    const pushed: Room[] = []
    hub.add('ABCDE', { playerId: 'p1', push: (x) => pushed.push(x) })
    await sleep(50)
    expect(calls).toBe(1)
    await sleep(1100)
    expect(calls).toBe(2)
    const r = { ...room(), code: 'ABCDE' }
    listeners[0](r)
    expect(pushed.map((x) => x.code)).toEqual(['ABCDE'])
  })
})
