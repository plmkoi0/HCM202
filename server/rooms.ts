// Lõi server (mục 9, 15.4): tạo / vào phòng, phòng chờ, hành động trong ván qua engine sẵn có,
// polling, kết nối WebSocket. Mỗi thay đổi: đọc phòng → kiểm quyền → chạy engine → ghi có kiểm
// tra version (thử lại khi có người ghi trước) → phát cho mọi instance. Không có timer trên
// server: hạn nằm ở `game.deadline`, quá hạn thì bất kỳ máy nào gửi TICK.

import { createGame, currentPlayer, pendingAutoAction, applyAction } from '../src/engine/reducer.js'
import { clientView } from '../src/engine/view.js'
import type { Action, GameData, PowerupId } from '../src/engine/types.js'
import { cleanNickname } from '../src/lib/text.js'
import { hashToken, newRoomCode, newSeed, newToken, normalizeCode, tokenMatches } from './auth.js'
import { colorCount, serverData } from './data.js'
import { RoomError } from './errors.js'
import { DEFAULT_PRESENCE, isPresent, needsSeen, setConnected, sweepPresence, transferHost, type PresenceOptions } from './presence.js'
import type { RoomStore } from './store.js'
import type { ClientAction, Credentials, Member, Room, RoomConfig, RoomPeek, RoomView, StateView } from './types.js'

export interface Limits {
  /** tạo phòng: [số lần, cửa sổ ms] mỗi địa chỉ IP, đếm chung giữa các instance (cả lớp có thể chung một IP Wi-Fi) */
  createPerIp: [number, number]
  /** vào phòng / xem phòng: mỗi IP, đếm trong từng instance */
  joinPerIp: [number, number]
  /** hành động: mỗi người, đếm trong từng instance */
  actionsPerPlayer: [number, number]
}

export const DEFAULT_LIMITS: Limits = {
  createPerIp: [120, 600_000],
  joinPerIp: [240, 60_000],
  actionsPerPlayer: [60, 10_000],
}

export interface ServiceOptions {
  store: RoomStore
  data?: GameData
  now?: () => number
  /** phòng tự xóa sau 6 giờ (mục 9) */
  roomTtlMs?: number
  /** giữ phòng thêm một lúc sau khi hết hạn để báo "phòng đã hết hạn" thay vì "không tìm thấy" */
  expiredGraceMs?: number
  presence?: Partial<PresenceOptions>
  limits?: Partial<Limits>
}

const MAX_ATTEMPTS = 12
const RECENT_LIMIT = 64
const CACHE_LIMIT = 500
/** người dùng polling ghi "lần poll gần nhất" tối đa mỗi chừng này */
const TOUCH_EVERY_MS = 10_000
const POWERUPS = new Set<PowerupId>(['advance3', 'extraRoll', 'fiftyFifty', 'swap', 'shield', 'double'])

/** Đếm tần suất trong bộ nhớ của instance (cửa sổ cố định) */
class LocalLimiter {
  private m = new Map<string, { n: number; resetAt: number }>()
  hit(key: string, [limit, windowMs]: [number, number], now: number): boolean {
    const c = this.m.get(key)
    if (!c || c.resetAt <= now) {
      if (this.m.size > 10_000) this.m.clear()
      this.m.set(key, { n: 1, resetAt: now + windowMs })
      return true
    }
    c.n += 1
    return c.n <= limit
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function isInt(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
}

export class RoomService {
  readonly store: RoomStore
  readonly data: GameData
  readonly now: () => number
  private ttlMs: number
  private graceMs: number
  private presence: PresenceOptions
  private limits: Limits
  private limiter = new LocalLimiter()
  private cache = new Map<string, Room>()
  private touched = new Map<string, number>()
  /** mã phòng không tồn tại vừa gặp (tránh tốn lệnh kho khi bị dò mã bừa) */
  private missing = new Map<string, number>()
  /** lần rà kết nối gần nhất do poll ở phòng chờ / sau ván (khi chủ phòng có vẻ đã đi) */
  private swept = new Map<string, number>()
  /** gọi sau mỗi lần ghi thành công (hub gửi ngay cho kết nối trên instance này, không chờ pub/sub) */
  onWrite: ((room: Room) => void) | null = null

  constructor(o: ServiceOptions) {
    this.store = o.store
    this.data = o.data ?? serverData
    this.now = o.now ?? Date.now
    this.ttlMs = o.roomTtlMs ?? 6 * 3600_000
    this.graceMs = o.expiredGraceMs ?? 600_000
    this.presence = { ...DEFAULT_PRESENCE, ...o.presence }
    this.limits = { ...DEFAULT_LIMITS, ...o.limits }
  }

  // ---------- bộ nhớ đệm trong instance ----------

  /** Ghi nhớ phòng mới nhất đã thấy (từ lần ghi của mình, lần đọc, hoặc tin pub/sub) */
  remember(room: Room): void {
    const cur = this.cache.get(room.code)
    if (cur && cur.version >= room.version) return
    this.cache.delete(room.code)
    if (this.cache.size >= CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value!)
    this.cache.set(room.code, room)
  }

  cached(code: string): Room | undefined {
    return this.cache.get(code)
  }

  private async load(code: string, preferCache: boolean): Promise<Room | null> {
    if (preferCache) {
      const c = this.cache.get(code)
      if (c) return c
    }
    const r = await this.store.get(code)
    if (r) this.remember(r)
    else this.cache.delete(code)
    return r
  }

  private ttlOf(room: Room, now: number): number {
    return Math.max(1000, room.expiresAt + this.graceMs - now)
  }

  private alive(room: Room | null, now: number, allowClosed = false): Room {
    if (!room) throw new RoomError('ROOM_NOT_FOUND')
    if (now >= room.expiresAt) throw new RoomError('ROOM_EXPIRED')
    if (room.status === 'closed' && !allowClosed) throw new RoomError('ROOM_CLOSED')
    return room
  }

  /**
   * Đọc – sửa – ghi có kiểm tra version, thử lại khi bị ghi trước. `fn` sửa bản nháp và trả
   * `write` (có đổi không); ném RoomError để hủy (không ghi). Trước `fn`: rà trạng thái kết nối.
   */
  private async mutate<T>(code: string, fn: (room: Room, now: number) => { result: T; write: boolean }, actorId?: string): Promise<{ room: Room; result: T }> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // lần đầu dùng bản trong bộ nhớ đệm (thường đã mới nhờ pub/sub); bản đó có thể cũ → mọi
      // lỗi hay xung đột đều đọc lại từ kho rồi thử lại, không trả lỗi dựa trên dữ liệu cũ
      const fromCache = attempt === 0 && this.cache.has(code)
      const base = this.alive(await this.load(code, attempt === 0), this.now(), true)
      const now = this.now()
      let seen: Record<string, number> = {}
      if (needsSeen(base, now, this.presence, actorId)) seen = await this.store.seen(code)
      const draft = structuredClone(base)
      const swept = base.status !== 'closed' && sweepPresence(draft, this.data, seen, now, this.presence, actorId)
      let r: { result: T; write: boolean }
      try {
        r = fn(draft, now)
      } catch (e) {
        if (fromCache && e instanceof RoomError) {
          const fresh = await this.load(code, false)
          if (fresh && fresh.version !== base.version) continue
        }
        throw e
      }
      if (!swept && !r.write) {
        // không đổi gì (vd. actionId trùng): bản đệm có thể cũ → trả bản mới nhất
        if (fromCache) {
          const fresh = await this.load(code, false)
          if (fresh && fresh.version !== base.version) continue
        }
        return { room: base, result: r.result }
      }
      draft.version = base.version + 1
      if (await this.store.put(draft, base.version, this.ttlOf(draft, now))) {
        this.remember(draft)
        this.onWrite?.(draft)
        return { room: draft, result: r.result }
      }
      this.cache.delete(code)
      await sleep(Math.floor(Math.random() * (5 + attempt * 10)))
    }
    throw new RoomError('BUSY')
  }

  // ---------- kiểm tra đầu vào ----------

  private cleanName(raw: unknown): string {
    const n = typeof raw === 'string' ? cleanNickname(raw) : null
    if (n === null) throw new RoomError('BAD_NAME')
    return n
  }

  private cleanColor(raw: unknown): number {
    if (!isInt(raw, 0, colorCount - 1)) throw new RoomError('BAD_REQUEST')
    return raw
  }

  /** Giữ các khóa cài đặt hợp lệ, bỏ phần còn lại (kể cả hạn thời gian từng pha) */
  sanitizeConfig(raw: unknown): RoomConfig {
    if (raw === undefined || raw === null) return {}
    if (typeof raw !== 'object') throw new RoomError('BAD_REQUEST')
    const x = raw as Record<string, unknown>
    const r = this.data.rules
    const out: RoomConfig = {}
    if ('layout' in x) {
      if (typeof x.layout !== 'string' || !Object.hasOwn(this.data.board.layouts, x.layout)) throw new RoomError('BAD_REQUEST')
      out.layout = x.layout
    }
    if ('timeLimitMin' in x) {
      if (!r.timeLimitOptions.includes(x.timeLimitMin as number | null)) throw new RoomError('BAD_REQUEST')
      out.timeLimitMin = x.timeLimitMin as number | null
    }
    if ('horsesPerPlayer' in x) {
      if (!r.options.horsesPerPlayer.includes(x.horsesPerPlayer as number)) throw new RoomError('BAD_REQUEST')
      out.horsesPerPlayer = x.horsesPerPlayer as number
    }
    if ('afterFirstFinish' in x) {
      if (!r.options.afterFirstFinish.includes(x.afterFirstFinish as string)) throw new RoomError('BAD_REQUEST')
      out.afterFirstFinish = x.afterFirstFinish as RoomConfig['afterFirstFinish']
    }
    for (const k of ['exactFinish', 'startFromStable', 'guessAlong'] as const) {
      if (k in x) {
        if (typeof x[k] !== 'boolean') throw new RoomError('BAD_REQUEST')
        out[k] = x[k] as boolean
      }
    }
    return out
  }

  private member(room: Room, playerId: unknown, token: unknown): Member {
    if (typeof playerId === 'string' && room.kicked.includes(playerId)) throw new RoomError('KICKED')
    const m = room.members.find((x) => x.id === playerId)
    if (!m || m.isBot || !tokenMatches(m.tokenHash, token)) throw new RoomError('UNAUTHORIZED')
    return m
  }

  private code(raw: unknown): string {
    const c = normalizeCode(raw)
    if (!c) throw new RoomError('ROOM_NOT_FOUND')
    return c
  }

  // ---------- xem trạng thái ----------

  view(room: Room, viewerId: string): StateView {
    const r: RoomView = {
      code: room.code,
      status: room.status,
      capacity: room.capacity,
      hostId: room.hostId,
      config: room.config,
      round: room.round,
      expiresAt: room.expiresAt,
      members: room.members.map((m) => ({ id: m.id, name: m.name, color: m.color, isBot: m.isBot, connected: m.isBot || m.connected, isHost: m.id === room.hostId, left: m.left })),
    }
    return { version: room.version, serverNow: this.now(), you: viewerId, room: r, game: room.game ? clientView(room.game, viewerId) : null }
  }

  // ---------- tạo / xem / vào phòng ----------

  private newMember(room: Room, name: string, color: number, isBot: boolean, now: number, token?: string): Member {
    const m: Member = {
      id: `p${room.nextId}`,
      name,
      color,
      isBot,
      joinedAt: now,
      tokenHash: token ? hashToken(token) : null,
      connected: true,
      links: {},
      lostAt: null,
      lastSeen: now,
      left: false,
    }
    room.nextId += 1
    room.members.push(m)
    return m
  }

  private freeColor(room: Room): number {
    for (let c = 0; c < colorCount; c++) if (!room.members.some((m) => m.color === c)) return c
    throw new RoomError('ROOM_FULL')
  }

  private addBot(room: Room, now: number): Member {
    const used = new Set(room.members.filter((m) => m.isBot).map((m) => m.name))
    const names = this.data.bots.names
    const name = names.find((n) => !used.has(n)) ?? names[room.members.length % names.length]
    return this.newMember(room, name, this.freeColor(room), true, now)
  }

  private startGame(room: Room, now: number): void {
    if (!room.members.some((m) => !m.isBot)) throw new RoomError('BAD_REQUEST')
    if (room.members.length > this.data.rules.maxPlayers) throw new RoomError('ROOM_FULL')
    room.game = createGame(this.data, {
      players: room.members.map((m) => ({ id: m.id, name: m.name, color: m.color, isBot: m.isBot })),
      config: room.config,
      seed: newSeed(),
      now,
    })
    room.game.rng = (room.game.rng ^ newSeed()) >>> 0
    // người đang mất kết nối lúc bắt đầu → engine biết ngay (tự bỏ lượt sau 20 s)
    for (const m of room.members) {
      if (!m.isBot && !m.connected) {
        const r = applyAction(this.data, room.game, { type: 'SET_CONNECTED', playerId: m.id, connected: false, now })
        if (r.ok) room.game = r.state
      }
    }
    room.status = 'playing'
    room.round += 1
  }

  async create(input: unknown, ip: string): Promise<{ room: Room; playerId: string; token: string }> {
    const x = (input ?? {}) as Record<string, unknown>
    const name = this.cleanName(x.name)
    const color = this.cleanColor(x.color)
    const max = this.data.rules.maxPlayers
    if (!isInt(x.capacity, 1, max)) throw new RoomError('BAD_REQUEST')
    const capacity = x.capacity
    const config = this.sanitizeConfig(x.config)
    const bots = x.bots === undefined ? 0 : x.bots
    if (!isInt(bots, 0, capacity === 1 ? max - 1 : 0)) throw new RoomError('BAD_REQUEST')
    if (!(await this.store.hit(`create:${ip}`, ...this.limits.createPerIp))) throw new RoomError('RATE_LIMITED')

    for (let attempt = 0; attempt < 20; attempt++) {
      const now = this.now()
      const token = newToken()
      const room: Room = {
        schema: 1,
        code: newRoomCode(),
        version: 1,
        createdAt: now,
        expiresAt: now + this.ttlMs,
        status: 'lobby',
        capacity,
        hostId: 'p1',
        config,
        members: [],
        nextId: 1,
        kicked: [],
        round: 0,
        game: null,
        recent: [],
      }
      const host = this.newMember(room, name, color, false, now, token)
      // phòng 1 chỗ: chọn số máy chơi cùng rồi vào ván ngay, bỏ qua phòng chờ (mục 9)
      if (capacity === 1) {
        for (let b = 0; b < bots; b++) this.addBot(room, now)
        this.startGame(room, now)
      }
      if (await this.store.put(room, 0, this.ttlOf(room, now))) {
        this.remember(room)
        return { room, playerId: host.id, token }
      }
    }
    throw new RoomError('BUSY')
  }

  /** Thông tin công khai trước khi vào (màu đã có người chọn, còn chỗ không) */
  async peek(rawCode: unknown, ip: string): Promise<RoomPeek> {
    if (!this.limiter.hit(`peek:${ip}`, this.limits.joinPerIp, this.now())) throw new RoomError('RATE_LIMITED')
    const code = this.code(rawCode)
    const now = this.now()
    const room = this.alive(await this.load(code, false), now)
    return {
      code,
      status: room.status,
      capacity: room.capacity,
      seats: room.members.length,
      takenColors: room.members.map((m) => m.color),
      expiresAt: room.expiresAt,
      serverNow: now,
    }
  }

  async join(rawCode: unknown, input: unknown, ip: string): Promise<{ room: Room; playerId: string; token: string }> {
    const code = this.code(rawCode)
    const x = (input ?? {}) as Record<string, unknown>
    const name = this.cleanName(x.name)
    const color = this.cleanColor(x.color)
    if (!this.limiter.hit(`join:${ip}`, this.limits.joinPerIp, this.now())) throw new RoomError('RATE_LIMITED')
    const token = newToken()
    const { room, result } = await this.mutate(code, (r, now) => {
      if (r.status === 'closed') throw new RoomError('ROOM_CLOSED')
      if (r.members.length >= r.capacity) throw new RoomError('ROOM_FULL')
      if (r.status !== 'lobby') throw new RoomError('ROOM_STARTED')
      if (r.members.some((m) => m.color === color)) throw new RoomError('COLOR_TAKEN')
      const m = this.newMember(r, name, color, false, now, token)
      return { result: m.id, write: true }
    })
    return { room, playerId: result, token }
  }

  // ---------- trạng thái (polling) ----------

  /**
   * Ảnh chụp cho người chơi; null nếu version vẫn bằng `since` (không đổi). Mỗi lần poll chỉ
   * đọc khóa version (1 lệnh); đọc cả phòng khi version đổi.
   */
  async state(cred: Credentials, since?: number): Promise<StateView | null> {
    const code = this.code(cred.code)
    const t0 = this.now()
    if ((this.missing.get(code) ?? 0) > t0) throw new RoomError('ROOM_NOT_FOUND')
    // token sai trên bản đệm → từ chối ngay, không tốn lệnh kho
    // (người chưa có trong bản đệm có thể vừa vào ở instance khác → đọc kho như thường)
    const cm = this.cache.get(code)?.members.find((x) => x.id === cred.playerId)
    if (cm && !cm.isBot && !tokenMatches(cm.tokenHash, cred.token)) throw new RoomError('UNAUTHORIZED')
    const v = await this.store.version(code)
    if (v === null) {
      if (this.missing.size > 10_000) this.missing.clear()
      this.missing.set(code, t0 + 10_000)
      throw new RoomError('ROOM_NOT_FOUND')
    }
    let room = this.cache.get(code)
    if (!room || room.version !== v) room = this.alive(await this.load(code, false), this.now(), true)
    const now = this.now()
    if (now >= room.expiresAt) throw new RoomError('ROOM_EXPIRED')
    const m = this.member(room, cred.playerId, cred.token)
    // người dùng polling: ghi lần poll gần nhất (thưa) — để biết còn kết nối
    const key = `${code}:${m.id}`
    const last = this.touched.get(key) ?? 0
    const hasLink = Object.values(m.links).some((at) => now - at < this.presence.linkMaxAgeMs)
    if (!hasLink && now - last >= TOUCH_EVERY_MS) {
      this.touched.set(key, now)
      if (this.touched.size > 20_000) this.touched.clear()
      await this.store.touch(code, m.id, now, this.ttlOf(room, now))
    }
    // đang bị coi là mất kết nối mà vẫn poll → nối lại (người đã bấm rời thì không: phải tự thao tác)
    if (!m.connected && !m.left && room.status !== 'closed') room = (await this.markPresent(cred)).room
    // phòng chờ / sau ván không có lần ghi nào: chủ phòng đóng tab thì phải có người "rà" để chuyển quyền
    const cur = room
    const host = cur.members.find((x) => x.id === cur.hostId)
    if (room.status !== 'playing' && room.status !== 'closed' && host && host.id !== m.id && host.connected && !isPresent(host, undefined, now, this.presence) && now - (this.swept.get(code) ?? 0) > 15_000) {
      this.swept.set(code, now)
      if (this.swept.size > 10_000) this.swept.clear()
      room = (await this.mutate(code, () => ({ result: null, write: false }), m.id)).room
    }
    if (since !== undefined && room.version === since) return null
    return this.view(room, m.id)
  }

  private markPresent(cred: Credentials): Promise<{ room: Room; result: null }> {
    return this.mutate(
      this.code(cred.code),
      (r, now) => {
        const m = this.member(r, cred.playerId, cred.token)
        if (m.connected || m.left) return { result: null, write: false }
        m.lastSeen = now
        setConnected(r, this.data, m, true, now)
        transferHost(r)
        return { result: null, write: true }
      },
      cred.playerId,
    )
  }

  // ---------- kết nối WebSocket ----------

  /** Mở kết nối: ghi nhận (một lần ghi), trả phòng mới nhất */
  async linkOpen(cred: Credentials, linkId: string): Promise<Room> {
    const { room } = await this.mutate(
      this.code(cred.code),
      (r, now) => {
        const m = this.member(r, cred.playerId, cred.token)
        m.links[linkId] = now
        m.lastSeen = now
        if (!m.left) setConnected(r, this.data, m, true, now)
        transferHost(r)
        return { result: null, write: r.status !== 'closed' }
      },
      cred.playerId,
    )
    return room
  }

  /** Đóng kết nối: bỏ khỏi danh sách; nếu không còn kết nối nào thì ghi lúc rớt (chờ nối lại 20 s) */
  async linkClose(code: string, playerId: string, linkId: string): Promise<void> {
    try {
      await this.mutate(code, (r, now) => {
        const m = r.members.find((x) => x.id === playerId)
        if (!m || !(linkId in m.links)) return { result: null, write: false }
        delete m.links[linkId]
        if (Object.keys(m.links).length === 0) m.lostAt = now
        return { result: null, write: r.status !== 'closed' }
      })
    } catch {
      // phòng đã hết hạn / đã đóng: không cần ghi
    }
  }

  // ---------- hành động ----------

  async act(cred: Credentials, actionId: unknown, action: unknown): Promise<{ room: Room; playerId: string; duplicate: boolean }> {
    const code = this.code(cred.code)
    if (typeof actionId !== 'string' || actionId.length < 1 || actionId.length > 64) throw new RoomError('BAD_REQUEST')
    if (!action || typeof action !== 'object' || typeof (action as { type?: unknown }).type !== 'string') throw new RoomError('BAD_REQUEST')
    const a = action as ClientAction
    // giới hạn tần suất đếm SAU khi xác thực (người lạ gửi token sai không khóa được người chơi thật);
    // token sai trên bản đệm → từ chối ngay, không tốn lệnh kho
    const cachedRoom = this.cache.get(code)
    if (cachedRoom) {
      const cm = cachedRoom.members.find((x) => x.id === cred.playerId)
      if (cm && !cm.isBot && !tokenMatches(cm.tokenHash, cred.token)) throw new RoomError('UNAUTHORIZED')
    }
    let counted = false
    const { room, result } = await this.mutate(
      code,
      (r, now) => {
        const m = this.member(r, cred.playerId, cred.token)
        if (!counted) {
          counted = true
          if (!this.limiter.hit(`act:${code}:${m.id}`, this.limits.actionsPerPlayer, now)) throw new RoomError('RATE_LIMITED')
        }
        if (r.recent.some((x) => x.id === actionId && x.by === m.id)) return { result: true, write: false }
        if (r.status === 'closed') throw new RoomError('ROOM_CLOSED')
        // người gửi chắc chắn có mặt → ghi "đã nối lại" TRƯỚC khi chạy hành động (engine thấy đúng
        // trạng thái kết nối). TICK không xóa cờ "đã rời" — chỉ thao tác chủ động mới xóa.
        m.lastSeen = now
        if (a.type !== 'LEAVE') {
          if (a.type !== 'TICK') m.left = false
          if (!m.left && !m.connected) {
            setConnected(r, this.data, m, true, now)
            transferHost(r)
          }
        }
        this.apply(r, m, a, now)
        r.recent.push({ id: actionId, by: m.id, v: r.version + 1 })
        if (r.recent.length > RECENT_LIMIT) r.recent.splice(0, r.recent.length - RECENT_LIMIT)
        return { result: false, write: true }
      },
      cred.playerId,
    )
    return { room, playerId: String(cred.playerId), duplicate: result }
  }

  private requireHost(r: Room, m: Member): void {
    if (r.hostId !== m.id) throw new RoomError('NOT_HOST')
  }

  private requireLobby(r: Room): void {
    if (r.status !== 'lobby') throw new RoomError('NOT_IN_LOBBY')
  }

  private engine(r: Room, action: Action): void {
    if (r.status === 'ended') throw new RoomError('GAME_ENDED')
    if (r.status !== 'playing' || !r.game) throw new RoomError('NOT_STARTED')
    // trộn thêm entropy từ server vào RNG: không đoán trước được xúc xắc / thẻ bẫy dù biết thuật toán
    const res = applyAction(this.data, { ...r.game, rng: (r.game.rng ^ newSeed()) >>> 0 }, action)
    if (!res.ok) throw new RoomError(res.error)
    r.game = res.state
    if (res.state.phase === 'ended') r.status = 'ended'
  }

  /** Áp dụng một hành động lên bản nháp phòng (ném RoomError nếu không hợp lệ) */
  private apply(r: Room, m: Member, a: ClientAction, now: number): void {
    const max = this.data.rules.maxPlayers
    switch (a.type) {
      case 'SET_CONFIG':
        this.requireHost(r, m)
        this.requireLobby(r)
        r.config = { ...r.config, ...this.sanitizeConfig(a.config) }
        return
      case 'SET_CAPACITY':
        this.requireHost(r, m)
        this.requireLobby(r)
        if (!isInt(a.capacity, 1, max)) throw new RoomError('BAD_REQUEST')
        if (a.capacity < r.members.length) throw new RoomError('CAPACITY_TOO_SMALL')
        r.capacity = a.capacity
        return
      case 'ADD_BOT':
        this.requireHost(r, m)
        this.requireLobby(r)
        if (r.members.length >= r.capacity) throw new RoomError('ROOM_FULL')
        this.addBot(r, now)
        return
      case 'REMOVE_BOT':
      case 'KICK': {
        this.requireHost(r, m)
        this.requireLobby(r)
        const t = r.members.find((x) => x.id === a.playerId)
        if (!t || t.id === m.id || t.isBot !== (a.type === 'REMOVE_BOT')) throw new RoomError('BAD_REQUEST')
        r.members = r.members.filter((x) => x.id !== t.id)
        if (a.type === 'KICK') r.kicked.push(t.id)
        return
      }
      case 'SET_COLOR': {
        this.requireLobby(r)
        const c = this.cleanColor(a.color)
        if (r.members.some((x) => x.id !== m.id && x.color === c)) throw new RoomError('COLOR_TAKEN')
        m.color = c
        return
      }
      case 'START':
        this.requireHost(r, m)
        this.requireLobby(r)
        this.startGame(r, now)
        return
      case 'LEAVE':
        if (r.status === 'lobby') {
          r.members = r.members.filter((x) => x.id !== m.id)
        } else {
          m.left = true
          m.links = {}
          setConnected(r, this.data, m, false, now)
        }
        if (!r.members.some((x) => !x.isBot && !x.left)) r.status = 'closed'
        else transferHost(r)
        return
      case 'REMATCH':
        this.requireHost(r, m)
        if (r.status !== 'ended') throw new RoomError('WRONG_PHASE')
        r.members = r.members.filter((x) => !x.left)
        r.capacity = Math.max(r.capacity, r.members.length)
        r.status = 'lobby'
        r.game = null
        return
      case 'END':
        this.requireHost(r, m)
        this.engine(r, { type: 'END', now })
        return
      case 'ROLL':
        return this.engine(r, { type: 'ROLL', actor: m.id, now })
      case 'CHOOSE_HORSE':
        if (!isInt(a.horse, 0, 9)) throw new RoomError('BAD_REQUEST')
        return this.engine(r, { type: 'CHOOSE_HORSE', actor: m.id, horse: a.horse, now })
      case 'ANSWER':
      case 'GUESS':
        if (!isInt(a.choice, 0, 9)) throw new RoomError('BAD_REQUEST')
        return this.engine(r, { type: a.type, actor: m.id, choice: a.choice, now })
      case 'USE_POWERUP':
        if (!POWERUPS.has(a.powerup)) throw new RoomError('BAD_REQUEST')
        return this.engine(r, { type: 'USE_POWERUP', actor: m.id, powerup: a.powerup, now })
      case 'DISCARD_POWERUP':
        if (a.discard !== 'new' && !POWERUPS.has(a.discard)) throw new RoomError('BAD_REQUEST')
        return this.engine(r, { type: 'DISCARD_POWERUP', actor: m.id, discard: a.discard, now })
      case 'NEXT_TURN': {
        // chơi qua phòng: chỉ người đến lượt được sang lượt sớm; lượt của máy thì chờ hết giờ hiện
        // giải thích để mọi người kịp đọc (mục 20, chi tiết G3)
        if (r.status !== 'playing' || !r.game) throw new RoomError(r.status === 'ended' ? 'GAME_ENDED' : 'NOT_STARTED')
        const cur = currentPlayer(r.game)
        return this.engine(r, { type: 'NEXT_TURN', actor: cur.id === m.id ? m.id : undefined, now })
      }
      case 'TICK': {
        if (r.status !== 'playing' || !r.game) throw new RoomError(r.status === 'ended' ? 'GAME_ENDED' : 'NOT_STARTED')
        const auto = pendingAutoAction(r.game, now)
        if (!auto) throw new RoomError('TOO_EARLY')
        return this.engine(r, auto)
      }
      default:
        throw new RoomError('UNKNOWN_ACTION')
    }
  }

  // ---------- kiểm tra sức khỏe ----------

  async health(): Promise<{ ok: boolean; store: string; pingMs: number | null; error?: string }> {
    try {
      const pingMs = await this.store.ping()
      return { ok: true, store: this.store.kind, pingMs }
    } catch (e) {
      return { ok: false, store: this.store.kind, pingMs: null, error: e instanceof Error ? e.message : String(e) }
    }
  }
}
