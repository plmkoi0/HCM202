// Giữ trạng thái phòng luôn mới (mục 15.4):
// - WebSocket trước; không nối được thì tự chuyển sang polling ~1,5 s/lần, thỉnh thoảng thử lại WebSocket.
// - Vercel Hobby đóng mỗi kết nối sau 300 s → chủ động mở kết nối mới ở ~280 s (chờ nếu mình
//   đang trả lời câu hỏi, chậm nhất ~290 s), nhận được trạng thái từ kết nối mới rồi mới đóng
//   kết nối cũ (không bị tính là mất kết nối).
// - Đang dùng WebSocket vẫn hỏi lại thưa (30 s) phòng khi lỡ tin.
// - Quá hạn (tự tung, hết giờ, bước của máy…) → gửi TICK; người đến lượt gửi trước, các máy khác
//   chờ thêm theo thứ tự để không gửi trùng nhiều.
// Hành động gửi qua HTTP kèm actionId; mất mạng thì gửi lại đúng actionId đó (server không áp dụng hai lần).

import type { ClientAction, StateView } from '../../server/types'
import { Api, ApiError, randomId, type Session } from './api'

export type ConnectionMode = 'connecting' | 'ws' | 'poll' | 'offline' | 'closed'

export interface ConnectionOptions {
  api: Api
  session: Session
  /** địa chỉ WebSocket; mặc định suy từ api.base hoặc location */
  wsUrl?: string | null
  onState: (view: StateView) => void
  onMode?: (mode: ConnectionMode) => void
  /** bị mời ra / phòng hết hạn / phiên không hợp lệ → dừng hẳn */
  onEnd?: (reason: string) => void
  WebSocketImpl?: typeof WebSocket | null
  pollMs?: number
  renewAfterMs?: number
  renewHardMs?: number
  safetyPollMs?: number
  helloTimeoutMs?: number
  pingMs?: number
  /** tự gửi TICK khi quá hạn (mặc định có) */
  autoTick?: boolean
}

const FATAL = new Set(['UNAUTHORIZED', 'KICKED', 'ROOM_NOT_FOUND', 'ROOM_EXPIRED', 'ROOM_CLOSED'])
const RETRY_DELAYS = [1000, 2000, 5000, 10_000, 30_000]

interface Sock {
  ws: WebSocket
  live: boolean
  /** đã bỏ (đóng chủ động / thay thế) — bỏ qua mọi sự kiện sau đó */
  dead: boolean
  openedAt: number
  timers: ReturnType<typeof setTimeout>[]
}

export class RoomConnection {
  view: StateView | null = null
  mode: ConnectionMode = 'connecting'
  private o: Required<Omit<ConnectionOptions, 'wsUrl' | 'onMode' | 'onEnd' | 'WebSocketImpl'>> & ConnectionOptions
  private sock: Sock | null = null
  private renewing: Sock | null = null
  private pollTimer: ReturnType<typeof setTimeout> | null = null
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private safetyTimer: ReturnType<typeof setInterval> | null = null
  private tickTimer: ReturnType<typeof setTimeout> | null = null
  private retries = 0
  private stopped = false
  private polling = false
  private tickFor = ''
  private tickTries = 0
  private listeners = new Set<(view: StateView) => void>()

  constructor(o: ConnectionOptions) {
    this.o = {
      pollMs: 1500,
      renewAfterMs: 280_000,
      renewHardMs: 290_000,
      safetyPollMs: 30_000,
      helloTimeoutMs: 6000,
      pingMs: 25_000,
      autoTick: true,
      ...o,
    }
  }

  get api(): Api {
    return this.o.api
  }

  /** Thêm người nghe trạng thái mới (ngoài `onState`); trả hàm hủy */
  listen(fn: (view: StateView) => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  /** giờ server ước tính */
  serverNow(): number {
    return this.o.api.clock.serverNow()
  }

  start(initial?: StateView): void {
    if (initial) this.accept(initial)
    if (typeof globalThis.addEventListener === 'function') globalThis.addEventListener('online', this.onOnline)
    if (this.wsImpl()) this.openSocket(false)
    else this.startPolling()
  }

  /** trình duyệt báo có mạng lại */
  private onOnline = (): void => {
    if (!this.stopped && this.mode !== 'ws') this.retrySocketSoon()
  }

  stop(): void {
    this.stopped = true
    if (typeof globalThis.removeEventListener === 'function') globalThis.removeEventListener('online', this.onOnline)
    this.setMode('closed')
    for (const s of [this.sock, this.renewing]) if (s) this.dropSocket(s, 1000, 'stop')
    this.sock = this.renewing = null
    for (const t of [this.pollTimer, this.retryTimer, this.tickTimer]) if (t) clearTimeout(t)
    if (this.safetyTimer) clearInterval(this.safetyTimer)
    this.pollTimer = this.retryTimer = this.tickTimer = this.safetyTimer = null
  }

  /** Gửi hành động; mất mạng thì thử lại với cùng actionId */
  async act(action: ClientAction): Promise<{ ok: true } | { ok: false; error: string; message?: string }> {
    const id = randomId()
    for (let attempt = 0; ; attempt++) {
      try {
        const r = await this.o.api.act(this.o.session, id, action)
        this.accept(r.state)
        // đã rời phòng → thôi giữ kết nối (không poll / TICK nữa, không bị tính là quay lại)
        if (action.type === 'LEAVE') this.stop()
        return { ok: true }
      } catch (e) {
        const err = e instanceof ApiError ? e : new ApiError('NETWORK', 0)
        if ((err.code === 'NETWORK' || err.code === 'BUSY') && attempt < 6 && !this.stopped) {
          // gửi lại đúng actionId trong khoảng ~15 s (server không áp dụng hai lần)
          await new Promise((r) => setTimeout(r, Math.min(5000, 500 * 2 ** attempt)))
          continue
        }
        if (FATAL.has(err.code)) this.end(err.code)
        return { ok: false, error: err.code, message: err.message }
      }
    }
  }

  // ---------- trạng thái ----------

  private accept(view: StateView): void {
    if (this.stopped) return
    if (this.view && view.version <= this.view.version) return
    this.view = view
    this.o.onState(view)
    for (const l of this.listeners) l(view)
    this.scheduleTick()
  }

  private setMode(m: ConnectionMode): void {
    if (this.mode === m) return
    this.mode = m
    this.o.onMode?.(m)
  }

  private end(reason: string): void {
    if (this.stopped) return
    this.stop()
    this.o.onEnd?.(reason)
  }

  // ---------- WebSocket ----------

  private wsImpl(): typeof WebSocket | null {
    if (this.o.WebSocketImpl !== undefined) return this.o.WebSocketImpl
    return typeof globalThis.WebSocket === 'function' ? globalThis.WebSocket : null
  }

  private wsUrl(): string {
    if (this.o.wsUrl) return this.o.wsUrl
    const base = this.o.api.base || (typeof location !== 'undefined' ? location.origin : 'http://127.0.0.1')
    return `${base.replace(/^http/, 'ws')}/api/ws`
  }

  private openSocket(renew: boolean): void {
    const Impl = this.wsImpl()
    if (!Impl || this.stopped) return
    let ws: WebSocket
    try {
      ws = new Impl(this.wsUrl())
    } catch {
      if (!renew) this.socketFailed()
      return
    }
    const s: Sock = { ws, live: false, dead: false, openedAt: Date.now(), timers: [] }
    if (renew) this.renewing = s
    else this.sock = s
    s.timers.push(
      setTimeout(() => {
        if (!s.live) this.dropSocket(s, 4000, 'hello-timeout')
      }, this.o.helloTimeoutMs),
    )
    ws.addEventListener('open', () => {
      if (s.dead) return
      const { code, playerId, token } = this.o.session
      ws.send(JSON.stringify({ t: 'hello', code, playerId, token }))
    })
    ws.addEventListener('message', (ev) => !s.dead && this.onSocketMessage(s, String(ev.data)))
    ws.addEventListener('close', (ev) => !s.dead && this.onSocketClose(s, ev.code, ev.reason))
    // lỗi: sự kiện close theo sau
  }

  private onSocketMessage(s: Sock, text: string): void {
    let msg: { t?: string; error?: string; reason?: string; at?: number; serverNow?: number } & Partial<StateView>
    try {
      msg = JSON.parse(text)
    } catch {
      return
    }
    if (msg.t === 'pong') {
      if (typeof msg.at === 'number' && typeof msg.serverNow === 'number') this.o.api.clock.sample(msg.serverNow, msg.at, Date.now())
      return
    }
    if (msg.t === 'bye') return this.end(msg.reason ?? 'LEFT')
    if (msg.t === 'error') {
      if (msg.error && FATAL.has(msg.error)) this.end(msg.error)
      return
    }
    if (msg.t !== 'state') return
    const { t: _t, ...view } = msg
    if (!s.live) this.becameLive(s)
    this.accept(view as StateView)
  }

  /** kết nối nhận được trạng thái đầu tiên → dùng nó; nếu là kết nối thay thế thì đóng kết nối cũ */
  private becameLive(s: Sock): void {
    s.live = true
    if (s === this.renewing) {
      const old = this.sock
      this.sock = s
      this.renewing = null
      if (old) this.dropSocket(old, 1000, 'renew')
    }
    this.retries = 0
    this.stopPolling()
    this.setMode('ws')
    // nhịp ping (chỉ để đo đồng hồ và giữ kết nối qua proxy — không ghi gì vào Redis)
    s.timers.push(
      setInterval(() => {
        if (s.ws.readyState === 1) s.ws.send(JSON.stringify({ t: 'ping', at: Date.now() }))
      }, this.o.pingMs) as unknown as ReturnType<typeof setTimeout>,
    )
    // thay kết nối trước mốc 300 s
    const check = () => {
      if (s !== this.sock || this.stopped) return
      const age = Date.now() - s.openedAt
      if (age >= this.o.renewHardMs || !this.answering()) {
        if (!this.renewing) this.openSocket(true)
        return
      }
      s.timers.push(setTimeout(check, 2000))
    }
    s.timers.push(setTimeout(check, Math.max(0, this.o.renewAfterMs - (Date.now() - s.openedAt))))
    this.startSafetyPoll()
  }

  /** mình đang trả lời câu hỏi → hoãn thay kết nối */
  private answering(): boolean {
    const g = this.view?.game
    return !!g && g.phase === 'question' && g.order[g.turnIndex] === this.o.session.playerId
  }

  private dropSocket(s: Sock, code: number, reason: string): void {
    for (const t of s.timers) clearTimeout(t)
    s.timers = []
    s.dead = true
    try {
      s.ws.close(code, reason)
    } catch {
      // đã đóng
    }
    if (s === this.renewing) this.renewing = null
    if (s === this.sock && !this.stopped && reason !== 'renew') {
      this.sock = null
      this.socketFailed()
    }
  }

  private onSocketClose(s: Sock, code: number, reason: string): void {
    for (const t of s.timers) clearTimeout(t)
    s.timers = []
    if (this.stopped) return
    if (s === this.renewing) {
      // kết nối thay thế hỏng: giữ kết nối cũ, thử lại sau 3 s (chưa tới mốc bị đóng)
      this.renewing = null
      setTimeout(() => {
        if (!this.stopped && this.sock && !this.renewing) this.openSocket(true)
      }, 3000)
      return
    }
    if (s !== this.sock) return
    this.sock = null
    if (code === 4003 && FATAL.has(reason)) return this.end(reason)
    if (code === 4004) return this.end('LEFT')
    this.socketFailed()
  }

  /**
   * Mạng có lại (sự kiện `online` của trình duyệt, hoặc lần poll đầu tiên thành công sau khi mất mạng):
   * đặt lại khoảng lùi và thử WebSocket sau ~0,5 s. Trước đây máy ở chế độ dự phòng tới hết khoảng
   * lùi đã tăng trong lúc mất mạng (1 → 2 → 5 → 10 → 30 s) — e2e 05/10 hỏng vì vậy.
   */
  retrySocketSoon(): void {
    if (this.stopped || this.sock || !this.wsImpl()) return
    this.retries = 0
    if (this.retryTimer) clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      if (!this.sock && !this.stopped) this.openSocket(false)
    }, 500)
  }

  /** WebSocket không dùng được → polling ngay, hẹn thử lại WebSocket */
  private socketFailed(): void {
    if (this.stopped) return
    this.startPolling()
    if (this.retryTimer) return
    const delay = RETRY_DELAYS[Math.min(this.retries, RETRY_DELAYS.length - 1)]!
    this.retries += 1
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      if (!this.sock && !this.stopped) this.openSocket(false)
    }, delay)
  }

  // ---------- polling ----------

  private startPolling(): void {
    if (this.polling || this.stopped) return
    this.polling = true
    if (this.safetyTimer) clearInterval(this.safetyTimer)
    this.safetyTimer = null
    this.setMode(this.mode === 'offline' ? 'offline' : 'poll')
    const loop = async () => {
      if (!this.polling || this.stopped) return
      await this.pollOnce()
      if (this.polling && !this.stopped) this.pollTimer = setTimeout(() => void loop(), this.o.pollMs)
    }
    void loop()
  }

  private stopPolling(): void {
    this.polling = false
    if (this.pollTimer) clearTimeout(this.pollTimer)
    this.pollTimer = null
  }

  private startSafetyPoll(): void {
    if (this.safetyTimer) clearInterval(this.safetyTimer)
    this.safetyTimer = setInterval(() => void this.pollOnce(), this.o.safetyPollMs)
  }

  async pollOnce(): Promise<void> {
    try {
      const v = await this.o.api.state(this.o.session, this.view?.version)
      if (this.polling && this.mode === 'offline') {
        this.setMode('poll')
        // mạng vừa có lại → thử WebSocket ngay, không chờ hết khoảng lùi (có thể tới 30 s)
        this.retrySocketSoon()
      }
      if (v) this.accept(v)
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'NETWORK'
      if (FATAL.has(code)) return this.end(code)
      if (code === 'NETWORK' && this.polling) this.setMode('offline')
    }
  }

  // ---------- tự động khi quá hạn ----------

  private scheduleTick(): void {
    if (!this.o.autoTick) return
    if (this.tickTimer) clearTimeout(this.tickTimer)
    this.tickTimer = null
    const g = this.view?.game
    if (!g || g.phase === 'ended' || g.deadline === null || this.view!.room.status !== 'playing') return
    const key = `${this.view!.version}`
    if (key !== this.tickFor) {
      this.tickFor = key
      this.tickTries = 0
    }
    // người đến lượt gửi trước; lượt của máy: người đầu tiên trong danh sách; các máy khác chờ thêm
    const me = this.o.session.playerId
    const current = g.order[g.turnIndex]
    const humans = this.view!.room.members.filter((m) => !m.isBot && m.connected && !m.left).map((m) => m.id)
    // mình đã rời / đang bị coi là mất kết nối → để máy khác gửi
    if (!humans.includes(me)) return
    const curIsHuman = humans.includes(current!)
    const rankIdx = current === me ? 0 : curIsHuman ? humans.indexOf(me) + 1 : humans.indexOf(me)
    const delay = 150 + Math.max(0, rankIdx) * 700 + this.tickTries * 1000
    const at = this.o.api.clock.toLocal(g.deadline) + delay
    this.tickTimer = setTimeout(() => void this.tick(key), Math.max(0, at - Date.now()))
  }

  private async tick(key: string): Promise<void> {
    if (this.stopped || key !== this.tickFor) return
    const r = await this.act({ type: 'TICK' })
    // lỗi (đồng hồ lệch, máy khác đã gửi, mất mạng, server bận) → hỏi lại rồi hẹn lại, tối đa vài lần
    if (!r.ok && !FATAL.has(r.error) && key === this.tickFor && this.tickTries < 8) {
      // đồng hồ lệch / máy khác đã gửi mà mình chưa thấy → hỏi lại rồi hẹn lại
      this.tickTries += 1
      await this.pollOnce()
      if (key === this.tickFor) this.scheduleTick()
    }
  }
}
