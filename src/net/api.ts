// Gọi API phòng chơi (mục 15.4). Chỉ dùng trong bản online — bản offline không nạp file này.

import type { ClientAction, CreateRoomInput, JoinRoomInput, RoomPeek, StateView } from '../../server/types'
import { ClockSync } from './clock'

export interface Session {
  code: string
  playerId: string
  token: string
}

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  constructor(code: string, status: number, message?: string) {
    super(message ?? code)
    this.code = code
    this.status = status
  }
}

export interface JoinResult extends Session {
  state: StateView
}

/** mã ngẫu nhiên cho actionId (crypto.randomUUID chỉ có trên https — trên mạng LAN http thì không) */
export function randomId(): string {
  const b = new Uint8Array(12)
  globalThis.crypto.getRandomValues(b)
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
}

export class Api {
  readonly base: string
  readonly clock: ClockSync
  private fetchImpl: typeof fetch

  constructor(base = '', clock = new ClockSync(), fetchImpl: typeof fetch = (...a) => globalThis.fetch(...a)) {
    this.base = base.replace(/\/$/, '')
    this.clock = clock
    this.fetchImpl = fetchImpl
  }

  private async request<T>(method: string, path: string, opts: { body?: unknown; session?: Session; timeoutMs?: number } = {}): Promise<{ status: number; data: T | null }> {
    const headers: Record<string, string> = { accept: 'application/json' }
    if (opts.body !== undefined) headers['content-type'] = 'application/json'
    if (opts.session) headers.authorization = `Bearer ${opts.session.playerId}.${opts.session.token}`
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10_000)
    const sentAt = Date.now()
    let res: Response
    try {
      res = await this.fetchImpl(`${this.base}${path}`, {
        method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        cache: 'no-store',
        signal: ctrl.signal,
      })
    } catch {
      throw new ApiError('NETWORK', 0)
    } finally {
      clearTimeout(timer)
    }
    const receivedAt = Date.now()
    if (res.status === 204) {
      const sn = Number(res.headers.get('x-server-now'))
      if (sn) this.clock.sample(sn, sentAt, receivedAt)
      return { status: 204, data: null }
    }
    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      throw new ApiError(res.ok ? 'BAD_RESPONSE' : 'NETWORK', res.status)
    }
    const d = data as { serverNow?: number; state?: { serverNow?: number }; error?: string; message?: string }
    const sn = d.serverNow ?? d.state?.serverNow
    if (typeof sn === 'number') this.clock.sample(sn, sentAt, receivedAt)
    if (!res.ok) throw new ApiError(d.error ?? 'NETWORK', res.status, d.message)
    return { status: res.status, data: data as T }
  }

  async health(): Promise<{ ok: boolean; store: string; pingMs: number | null }> {
    try {
      return (await this.request<{ ok: boolean; store: string; pingMs: number | null }>('GET', '/api/health')).data!
    } catch (e) {
      if (e instanceof ApiError && e.status === 503) return { ok: false, store: 'none', pingMs: null }
      throw e
    }
  }

  async create(input: CreateRoomInput): Promise<JoinResult> {
    return (await this.request<JoinResult>('POST', '/api/rooms', { body: input })).data!
  }

  async peek(code: string): Promise<RoomPeek> {
    return (await this.request<RoomPeek>('GET', `/api/rooms/${encodeURIComponent(code)}`)).data!
  }

  async join(code: string, input: JoinRoomInput): Promise<JoinResult> {
    return (await this.request<JoinResult>('POST', `/api/rooms/${encodeURIComponent(code)}/join`, { body: input })).data!
  }

  async act(session: Session, actionId: string, action: ClientAction): Promise<{ ok: true; duplicate: boolean; state: StateView }> {
    return (await this.request<{ ok: true; duplicate: boolean; state: StateView }>('POST', `/api/rooms/${session.code}/actions`, { body: { actionId, action }, session })).data!
  }

  /** null = không đổi kể từ `since` */
  async state(session: Session, since?: number): Promise<StateView | null> {
    const q = since !== undefined ? `?since=${since}` : ''
    return (await this.request<StateView>('GET', `/api/rooms/${session.code}/state${q}`, { session })).data
  }
}
