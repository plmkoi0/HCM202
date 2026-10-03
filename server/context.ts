// Chọn kho phòng theo biến môi trường (mục 15.4, .env.example):
// - có URL Redis (Upstash qua Vercel Marketplace) → Redis thật;
// - chạy cục bộ không có URL → kho trong bộ nhớ (một tiến trình, đủ để chơi thử trên mạng LAN);
// - chạy trên Vercel mà chưa gắn Redis → không phục vụ phòng (mỗi instance một bộ nhớ riêng
//   sẽ làm hỏng phòng), /api/health báo thiếu biến nào.

import { Hub } from './hub.js'
import { MemoryStore } from './memoryStore.js'
import { RedisStore } from './redisStore.js'
import { RoomService, type ServiceOptions } from './rooms.js'
import type { RoomStore } from './store.js'

/** Tên biến chứa URL Redis giao thức TCP (rediss://…), xét theo thứ tự. Vercel Marketplace (Upstash)
 *  đặt KV_URL / REDIS_URL; tạo DB trực tiếp trên Upstash thì tự đặt REDIS_URL. */
export const REDIS_URL_VARS = ['REDIS_URL', 'KV_URL', 'UPSTASH_REDIS_URL'] as const

export interface ServerContext {
  service: RoomService
  hub: Hub
}

export interface EnvContext {
  ctx: ServerContext | null
  /** biến môi trường còn thiếu (khi ctx = null) */
  missing: string[]
}

export function redisUrlFromEnv(env: Record<string, string | undefined>): string | null {
  for (const k of REDIS_URL_VARS) {
    const v = env[k]?.trim()
    if (v && /^rediss?:\/\//.test(v)) return v
  }
  return null
}

export function createContext(store: RoomStore, opts: Omit<ServiceOptions, 'store'> = {}): ServerContext {
  const service = new RoomService({ ...opts, store })
  const hub = new Hub(service)
  return { service, hub }
}

export function contextFromEnv(env: Record<string, string | undefined> = process.env): EnvContext {
  const url = redisUrlFromEnv(env)
  if (url) return { ctx: createContext(new RedisStore(url)), missing: [] }
  if (env.VERCEL) {
    const hint = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL ? ' (đã có biến REST nhưng thiếu URL TCP rediss://)' : ''
    return { ctx: null, missing: [`${REDIS_URL_VARS.join(' | ')}${hint}`] }
  }
  return { ctx: createContext(new MemoryStore()), missing: [] }
}

let shared: EnvContext | null = null

/** Một bối cảnh cho cả instance (Vercel giữ instance giữa các lần gọi) */
export function getContext(): EnvContext {
  shared ??= contextFromEnv()
  return shared
}
