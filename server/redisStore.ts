// Kho phòng trên Redis thật (Upstash for Redis qua Vercel Marketplace — mục 15.4), dùng giao thức
// Redis (TCP, rediss://). Hai kết nối mỗi instance: một cho lệnh, một cho pub/sub (chỉ mở khi
// instance có kết nối WebSocket cần theo dõi phòng). Mỗi lần ghi phòng là MỘT lệnh EVAL: kiểm
// version, ghi phòng + version, đặt hạn, publish — nguyên tử và đúng thứ tự.

import { createClient } from 'redis'
import { channelOf, roomKey, seenKey, versionKey, type RoomStore, type StoreStats } from './store.js'
import type { Room } from './types.js'

const PUT_SCRIPT = `
local cur = redis.call('GET', KEYS[2])
if cur == false then cur = '0' end
if cur ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[4])
redis.call('SET', KEYS[2], ARGV[3], 'PX', ARGV[4])
redis.call('PUBLISH', ARGV[5], ARGV[2])
return 1`

const TOUCH_SCRIPT = `
redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
redis.call('PEXPIRE', KEYS[1], ARGV[3])
return 1`

const HIT_SCRIPT = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return n`

type Client = ReturnType<typeof createClient>

/** Hạn chờ mỗi lệnh: Redis chập chờn / sai mật khẩu thì báo lỗi nhanh (503) thay vì treo tới hết thời gian function */
const COMMAND_TIMEOUT_MS = 4000

function withTimeout<T>(p: Promise<T>, what: string): Promise<T> {
  let t: ReturnType<typeof setTimeout>
  return Promise.race([
    p,
    new Promise<never>((_, reject) => {
      t = setTimeout(() => reject(new Error(`Redis không trả lời (${what})`)), COMMAND_TIMEOUT_MS)
    }),
  ]).finally(() => clearTimeout(t))
}

export class RedisStore implements RoomStore {
  readonly kind = 'redis' as const
  private client: Client
  private ready: Promise<Client> | null = null
  private sub: Client | null = null
  private subReady: Promise<Client> | null = null
  private listeners = new Map<string, Set<(room: Room) => void>>()
  private st: StoreStats = { commands: {}, received: 0 }
  private closed = false
  private everReady = false

  constructor(url: string) {
    this.client = createClient({
      url,
      // chưa từng kết nối được (sai URL / mật khẩu) → bỏ cuộc sau vài lần để báo lỗi; đã từng kết nối → thử lại mãi
      socket: { connectTimeout: 5000, reconnectStrategy: (retries: number) => (!this.everReady && retries >= 3 ? new Error('Không kết nối được Redis') : Math.min(100 + retries * 200, 2000)) },
    })
    this.client.on('error', (e: unknown) => console.error('[redis] lỗi kết nối lệnh', e instanceof Error ? e.message : e))
  }

  private count(name: string): void {
    this.st.commands[name] = (this.st.commands[name] ?? 0) + 1
  }

  private conn(): Promise<Client> {
    if (this.closed) return Promise.reject(new Error('Kho Redis đã đóng'))
    this.ready ??= withTimeout(this.client.connect(), 'kết nối').then(
      () => {
        this.everReady = true
        return this.client
      },
      (e: unknown) => {
        this.ready = null
        throw e
      },
    )
    return this.ready
  }

  private subscriber(): Promise<Client> {
    if (this.closed) return Promise.reject(new Error('Kho Redis đã đóng'))
    if (!this.subReady) {
      const sub = this.client.duplicate()
      sub.on('error', (e: unknown) => console.error('[redis] lỗi kết nối pub/sub', e instanceof Error ? e.message : e))
      this.sub = sub
      this.subReady = sub.connect().then(
        () => sub,
        (e: unknown) => {
          this.subReady = null
          this.sub = null
          throw e
        },
      )
    }
    return this.subReady
  }

  async get(code: string): Promise<Room | null> {
    const c = await this.conn()
    this.count('GET:room')
    const s = await withTimeout(c.get(roomKey(code)), 'get')
    return s ? (JSON.parse(String(s)) as Room) : null
  }

  async version(code: string): Promise<number | null> {
    const c = await this.conn()
    this.count('GET:version')
    const s = await withTimeout(c.get(versionKey(code)), 'get')
    return s === null || s === undefined ? null : Number(s)
  }

  async put(room: Room, expected: number, ttlMs: number): Promise<boolean> {
    const c = await this.conn()
    this.count('EVAL:put')
    const r = await withTimeout(c.eval(PUT_SCRIPT, {
      keys: [roomKey(room.code), versionKey(room.code)],
      arguments: [String(expected), JSON.stringify(room), String(room.version), String(Math.max(1, Math.round(ttlMs))), channelOf(room.code)],
    }), 'ghi phòng')
    if (Number(r) === 1) return true
    this.count('(put bị từ chối)')
    return false
  }

  async touch(code: string, playerId: string, at: number, ttlMs: number): Promise<void> {
    const c = await this.conn()
    this.count('EVAL:touch')
    await withTimeout(c.eval(TOUCH_SCRIPT, { keys: [seenKey(code)], arguments: [playerId, String(at), String(Math.max(1, Math.round(ttlMs)))] }), 'touch')
  }

  async seen(code: string): Promise<Record<string, number>> {
    const c = await this.conn()
    this.count('HGETALL')
    const h = (await withTimeout(c.hGetAll(seenKey(code)), 'hGetAll')) as Record<string, string>
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(h)) out[k] = Number(v)
    return out
  }

  async subscribe(code: string, listener: (room: Room) => void): Promise<() => Promise<void>> {
    const ch = channelOf(code)
    let set = this.listeners.get(ch)
    if (!set) {
      set = new Set()
      this.listeners.set(ch, set)
      const sub = await this.subscriber()
      this.count('SUBSCRIBE')
      const own = set
      await sub.subscribe(ch, (message: string) => {
        this.st.received += 1
        let room: Room
        try {
          room = JSON.parse(message) as Room
        } catch {
          return
        }
        for (const l of own) l(room)
      })
    }
    set.add(listener)
    const own = set
    return async () => {
      own.delete(listener)
      if (own.size > 0 || this.listeners.get(ch) !== own) return
      this.listeners.delete(ch)
      if (this.sub) {
        this.count('UNSUBSCRIBE')
        await this.sub.unsubscribe(ch).catch(() => {})
      }
    }
  }

  async hit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const c = await this.conn()
    this.count('EVAL:hit')
    const n = await withTimeout(c.eval(HIT_SCRIPT, { keys: [`rl:${key}`], arguments: [String(windowMs)] }), 'hit')
    return Number(n) <= limit
  }

  async ping(): Promise<number> {
    const t0 = performance.now()
    const c = await this.conn()
    await withTimeout(c.ping(), 'ping')
    return Math.round(performance.now() - t0)
  }

  async close(): Promise<void> {
    this.closed = true
    const tasks: Promise<unknown>[] = []
    if (this.subReady && this.sub) tasks.push(this.sub.close().catch(() => {}))
    if (this.ready) tasks.push(this.client.close().catch(() => {}))
    await Promise.all(tasks)
    this.ready = null
    this.subReady = null
    this.sub = null
  }

  stats(): StoreStats {
    return { commands: { ...this.st.commands }, received: this.st.received }
  }
}
