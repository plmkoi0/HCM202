// Hợp đồng kho phòng: cùng một bộ kiểm tra cho kho trong bộ nhớ và Redis thật (redis-server
// cục bộ — cùng giao thức với Upstash). Không có redis-server thì bỏ qua phần Redis.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { createServer } from 'node:net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createContext } from '../server/context'
import { MemoryStore } from '../server/memoryStore'
import { RedisStore } from '../server/redisStore'
import { RoomService } from '../server/rooms'
import type { RoomStore } from '../server/store'
import type { Room } from '../server/types'

const hasRedis = spawnSync('redis-server', ['--version']).status === 0
let redisProc: ChildProcess | null = null
let redisUrl = ''

function freePort(): Promise<number> {
  return new Promise((ok) => {
    const s = createServer()
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as { port: number }).port
      s.close(() => ok(p))
    })
  })
}

beforeAll(async () => {
  if (!hasRedis) return
  const port = await freePort()
  redisProc = spawn('redis-server', ['--port', String(port), '--save', '', '--appendonly', 'no', '--bind', '127.0.0.1'], { stdio: 'ignore' })
  redisUrl = `redis://127.0.0.1:${port}`
  // chờ redis sẵn sàng
  for (let i = 0; i < 50; i++) {
    const s = new RedisStore(redisUrl)
    try {
      await s.ping()
      await s.close()
      return
    } catch {
      await s.close().catch(() => {})
      await new Promise((r) => setTimeout(r, 100))
    }
  }
  throw new Error('redis-server không khởi động được')
})

afterAll(() => {
  redisProc?.kill('SIGKILL')
})

let roomN = 0
function room(version = 1): Room {
  roomN += 1
  return {
    schema: 1,
    code: `S${roomN}-${process.pid}`,
    version,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600_000,
    status: 'lobby',
    capacity: 5,
    hostId: 'p1',
    config: {},
    members: [],
    nextId: 2,
    kicked: [],
    round: 0,
    game: null,
    recent: [],
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function contract(name: string, make: () => RoomStore, enabled = true) {
  describe.skipIf(!enabled)(`Kho phòng — ${name}`, () => {
    it('ghi có kiểm tra version: tạo mới khi chưa có, từ chối khi version lệch', async () => {
      const s = make()
      const r = room()
      expect(await s.get(r.code)).toBeNull()
      expect(await s.version(r.code)).toBeNull()
      expect(await s.put(r, 0, 60_000)).toBe(true)
      expect(await s.put(r, 0, 60_000)).toBe(false)
      expect(await s.version(r.code)).toBe(1)
      expect(await s.get(r.code)).toEqual(r)
      const r2 = { ...r, version: 2, status: 'playing' as const }
      expect(await s.put(r2, 5, 60_000)).toBe(false)
      expect(await s.put(r2, 1, 60_000)).toBe(true)
      expect((await s.get(r.code))!.status).toBe('playing')
      await s.close()
    })

    it('hết hạn theo ttl', async () => {
      const s = make()
      const r = room()
      expect(await s.put(r, 0, 150)).toBe(true)
      await sleep(400)
      expect(await s.get(r.code)).toBeNull()
      expect(await s.version(r.code)).toBeNull()
      await s.close()
    })

    it('pub/sub: người theo dõi nhận phòng mới theo đúng thứ tự ghi; hủy thì thôi nhận', async () => {
      const s = make()
      const r = room()
      const got: number[] = []
      const unsub = await s.subscribe(r.code, (x) => got.push(x.version))
      await s.put(r, 0, 60_000)
      for (let v = 2; v <= 6; v++) await s.put({ ...r, version: v }, v - 1, 60_000)
      for (let i = 0; i < 100 && got.length < 6; i++) await sleep(10)
      expect(got).toEqual([1, 2, 3, 4, 5, 6])
      await unsub()
      await s.put({ ...r, version: 7 }, 6, 60_000)
      await sleep(100)
      expect(got.length).toBe(6)
      await s.close()
    })

    it('lần poll gần nhất (hash) và giới hạn tần suất', async () => {
      const s = make()
      const r = room()
      expect(await s.seen(r.code)).toEqual({})
      await s.touch(r.code, 'p1', 111, 60_000)
      await s.touch(r.code, 'p2', 222, 60_000)
      await s.touch(r.code, 'p1', 333, 60_000)
      expect(await s.seen(r.code)).toEqual({ p1: 333, p2: 222 })
      const key = `t-${r.code}`
      const hits = []
      for (let i = 0; i < 4; i++) hits.push(await s.hit(key, 3, 60_000))
      expect(hits).toEqual([true, true, true, false])
      expect(await s.ping()).toBeGreaterThanOrEqual(0)
      await s.close()
    })

    it('6 người cùng vào phòng 5 chỗ qua kho này → đúng 5', async () => {
      const store = make()
      const svc = new RoomService({ store })
      const h = await svc.create({ name: 'Chủ', color: 0, capacity: 5 }, 'ip')
      const res = await Promise.allSettled([1, 2, 3, 4, 5].map((c) => svc.join(h.room.code, { name: `N${c}`, color: c }, 'ip')))
      expect(res.filter((x) => x.status === 'fulfilled').length).toBe(4)
      expect((await store.get(h.room.code))!.members.length).toBe(5)
      await store.close()
    })
  })
}

contract('trong bộ nhớ', () => new MemoryStore())
contract('Redis (redis-server cục bộ)', () => new RedisStore(redisUrl), hasRedis)

describe.skipIf(!hasRedis)('Redis — nhiều instance dùng chung một kho', () => {
  it('kết nối ở instance A nhận thay đổi do instance B ghi (pub/sub)', async () => {
    const a = createContext(new RedisStore(redisUrl))
    const b = createContext(new RedisStore(redisUrl))
    const h = await a.service.create({ name: 'Chủ', color: 0, capacity: 5 }, 'ip')
    const seen: number[] = []
    a.hub.add(h.room.code, { playerId: 'p1', push: (r) => seen.push(r.version) })
    await sleep(100)
    await b.service.join(h.room.code, { name: 'Khách', color: 1 }, 'ip')
    await b.service.act({ code: h.room.code, playerId: 'p1', token: h.token }, 'x1', { type: 'ADD_BOT' })
    for (let i = 0; i < 100 && !seen.includes(3); i++) await sleep(10)
    expect(seen).toContain(2)
    expect(seen).toContain(3)
    expect(a.service.cached(h.room.code)!.version).toBe(3)
    await a.service.store.close()
    await b.service.store.close()
  })
})
