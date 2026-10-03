// API HTTP (mục 15.4) — hàm xử lý kiểu Web (Request → Response), dùng chung cho server Node
// cục bộ và Vercel Functions.
//
//   GET  /api/health                       kiểm tra trước buổi chơi
//   POST /api/rooms                        tạo phòng        {name, color, capacity, config?, bots?}
//   GET  /api/rooms/:code                  xem phòng trước khi vào (màu đã chọn, còn chỗ)
//   POST /api/rooms/:code/join             vào phòng        {name, color}
//   POST /api/rooms/:code/actions          hành động        {actionId, action}          (cần xác thực)
//   GET  /api/rooms/:code/state?since=N    polling: 204 nếu không đổi, 200 + ảnh chụp  (cần xác thực)
//   GET  /api/ws                           WebSocket (xem socket.ts)
// Xác thực: header `Authorization: Bearer <playerId>.<token>`.

import { RoomError, errorMessage } from './errors.js'
import type { RoomService } from './rooms.js'
import type { Credentials } from './types.js'

export const MAX_BODY = 16 * 1024

export interface ApiContext {
  service: RoomService
}

const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex, nofollow',
}

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...extra } })
}

export function errorResponse(code: string, status: number): Response {
  return json({ error: code, message: errorMessage(code) }, status)
}

/** Địa chỉ IP người gọi (Vercel đặt x-forwarded-for / x-real-ip) */
export function clientIp(req: Request, fallback = 'local'): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? fallback
}

function credentials(req: Request, code: string): Credentials {
  const h = req.headers.get('authorization') ?? ''
  const m = /^Bearer ([A-Za-z0-9]{1,16})\.([A-Za-z0-9_-]{1,128})$/.exec(h.trim())
  if (!m) throw new RoomError('UNAUTHORIZED')
  return { code, playerId: m[1]!, token: m[2]! }
}

async function readJson(req: Request): Promise<unknown> {
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > MAX_BODY) throw new RoomError('BAD_REQUEST')
  const text = await req.text()
  if (text.length > MAX_BODY) throw new RoomError('BAD_REQUEST')
  if (text.trim() === '') return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new RoomError('BAD_REQUEST')
  }
}

const ROOM_PATH = /^\/api\/rooms\/([^/]+)(?:\/(join|actions|state))?\/?$/

/**
 * Xử lý một yêu cầu /api. `ctx` null = server chưa gắn kho (Vercel chưa có Redis) → báo rõ.
 * `missing` liệt kê biến môi trường còn thiếu (hiện ở /api/health).
 */
export async function handleApi(ctx: ApiContext | null, req: Request, ip: string, missing: string[] = []): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method.toUpperCase()
  try {
    if (path === '/api/health' || path === '/api/health/') {
      if (method !== 'GET' && method !== 'HEAD') return errorResponse('BAD_REQUEST', 405)
      if (!ctx) return json({ ok: false, store: 'none', error: errorMessage('SERVER_NOT_READY'), missing, serverNow: Date.now() }, 503)
      const h = await ctx.service.health()
      return json({ ...h, serverNow: ctx.service.now() }, h.ok ? 200 : 503)
    }
    if (!ctx) return errorResponse('SERVER_NOT_READY', 503)
    const service = ctx.service

    if (path === '/api/rooms' || path === '/api/rooms/') {
      if (method !== 'POST') return errorResponse('BAD_REQUEST', 405)
      const r = await service.create(await readJson(req), ip)
      return json({ code: r.room.code, playerId: r.playerId, token: r.token, state: service.view(r.room, r.playerId) }, 201)
    }

    const m = ROOM_PATH.exec(path)
    if (m) {
      let code: string
      try {
        code = decodeURIComponent(m[1]!)
      } catch {
        throw new RoomError('ROOM_NOT_FOUND')
      }
      const sub = m[2]
      if (!sub) {
        if (method !== 'GET') return errorResponse('BAD_REQUEST', 405)
        return json(await service.peek(code, ip))
      }
      if (sub === 'join') {
        if (method !== 'POST') return errorResponse('BAD_REQUEST', 405)
        const r = await service.join(code, await readJson(req), ip)
        return json({ code: r.room.code, playerId: r.playerId, token: r.token, state: service.view(r.room, r.playerId) }, 201)
      }
      if (sub === 'actions') {
        if (method !== 'POST') return errorResponse('BAD_REQUEST', 405)
        const cred = credentials(req, code)
        const b = (await readJson(req)) as { actionId?: unknown; action?: unknown }
        const r = await service.act(cred, b.actionId, b.action)
        return json({ ok: true, duplicate: r.duplicate, state: service.view(r.room, r.playerId) })
      }
      // state (polling)
      if (method !== 'GET') return errorResponse('BAD_REQUEST', 405)
      const cred = credentials(req, code)
      const s = url.searchParams.get('since')
      const since = s !== null && /^\d{1,12}$/.test(s) ? Number(s) : undefined
      const view = await service.state(cred, since)
      if (!view) return new Response(null, { status: 204, headers: { 'cache-control': 'no-store', 'x-server-now': String(service.now()) } })
      return json(view)
    }
    return errorResponse('BAD_REQUEST', 404)
  } catch (e) {
    if (e instanceof RoomError) return errorResponse(e.code, e.status)
    console.error('[api] lỗi không mong đợi', method, path, e instanceof Error ? e.message : e)
    return json({ error: 'BUSY', message: errorMessage('BUSY') }, 503)
  }
}
