// Kho phòng giả lập trong bộ nhớ: cho test, mô phỏng tải và chạy cục bộ không cần tài khoản.
// Giữ phòng dưới dạng chuỗi JSON (như Redis) để không chia sẻ object giữa các "instance";
// tin pub/sub giao bất đồng bộ. Đếm lệnh theo cách Redis tính (mỗi EVAL là một lệnh).

import { channelOf, type RoomStore, type StoreStats } from './store.js'
import type { Room } from './types.js'

interface Entry {
  json: string
  version: number
  expiresAt: number
}

export class MemoryStore implements RoomStore {
  readonly kind = 'memory' as const
  private rooms = new Map<string, Entry>()
  private seenMap = new Map<string, { at: Record<string, number>; expiresAt: number }>()
  private counters = new Map<string, { n: number; resetAt: number }>()
  private listeners = new Map<string, Set<(room: Room) => void>>()
  private st: StoreStats = { commands: {}, received: 0 }
  private now: () => number
  /** độ trễ giả lập của mỗi lệnh (mô phỏng tải) */
  private latencyMs: number

  constructor(now: () => number = Date.now, latencyMs = 0) {
    this.now = now
    this.latencyMs = latencyMs
  }

  private async cmd(name: string): Promise<void> {
    this.st.commands[name] = (this.st.commands[name] ?? 0) + 1
    if (this.latencyMs > 0) await new Promise((r) => setTimeout(r, this.latencyMs))
  }

  private live(code: string): Entry | null {
    const e = this.rooms.get(code)
    if (!e) return null
    if (e.expiresAt <= this.now()) {
      this.rooms.delete(code)
      this.seenMap.delete(code)
      return null
    }
    return e
  }

  async get(code: string): Promise<Room | null> {
    await this.cmd('GET:room')
    const e = this.live(code)
    return e ? (JSON.parse(e.json) as Room) : null
  }

  async version(code: string): Promise<number | null> {
    await this.cmd('GET:version')
    return this.live(code)?.version ?? null
  }

  async put(room: Room, expected: number, ttlMs: number): Promise<boolean> {
    await this.cmd('EVAL:put')
    const cur = this.live(room.code)?.version ?? 0
    if (cur !== expected) {
      this.st.commands['(put bị từ chối)'] = (this.st.commands['(put bị từ chối)'] ?? 0) + 1
      return false
    }
    const json = JSON.stringify(room)
    this.rooms.set(room.code, { json, version: room.version, expiresAt: this.now() + ttlMs })
    const ls = this.listeners.get(channelOf(room.code))
    if (ls && ls.size > 0) {
      // như Redis: tin phát theo đúng thứ tự ghi, mỗi người nhận một bản sao riêng
      for (const l of ls) {
        setTimeout(() => {
          this.st.received += 1
          l(JSON.parse(json) as Room)
        }, 0)
      }
    }
    return true
  }

  async touch(code: string, playerId: string, at: number, ttlMs: number): Promise<void> {
    await this.cmd('EVAL:touch')
    const cur = this.seenMap.get(code)
    const entry = cur && cur.expiresAt > this.now() ? cur : { at: {}, expiresAt: 0 }
    entry.at[playerId] = at
    entry.expiresAt = this.now() + ttlMs
    this.seenMap.set(code, entry)
  }

  async seen(code: string): Promise<Record<string, number>> {
    await this.cmd('HGETALL')
    const cur = this.seenMap.get(code)
    return cur && cur.expiresAt > this.now() ? { ...cur.at } : {}
  }

  async subscribe(code: string, listener: (room: Room) => void): Promise<() => Promise<void>> {
    await this.cmd('SUBSCRIBE')
    const ch = channelOf(code)
    const set = this.listeners.get(ch) ?? new Set()
    set.add(listener)
    this.listeners.set(ch, set)
    return async () => {
      await this.cmd('UNSUBSCRIBE')
      set.delete(listener)
      if (set.size === 0) this.listeners.delete(ch)
    }
  }

  async hit(key: string, limit: number, windowMs: number): Promise<boolean> {
    await this.cmd('EVAL:hit')
    const now = this.now()
    const c = this.counters.get(key)
    if (!c || c.resetAt <= now) {
      this.counters.set(key, { n: 1, resetAt: now + windowMs })
      return limit >= 1
    }
    c.n += 1
    return c.n <= limit
  }

  async ping(): Promise<number> {
    return 0
  }

  async close(): Promise<void> {
    this.listeners.clear()
  }

  stats(): StoreStats {
    return { commands: { ...this.st.commands }, received: this.st.received }
  }

  /** cho test: số phòng đang lưu */
  size(): number {
    return [...this.rooms.keys()].filter((c) => this.live(c)).length
  }
}
