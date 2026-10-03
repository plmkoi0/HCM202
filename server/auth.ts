// Mã phòng, token người chơi, seed ván (mục 9, 15.4).

import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'

/** 5 ký tự, bỏ các ký tự dễ nhầm 0/O, 1/I/L */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 5

export function newRoomCode(): string {
  let s = ''
  for (let i = 0; i < CODE_LENGTH; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return s
}

/** Chuẩn hóa mã người dùng nhập (chữ thường, khoảng trắng); null nếu sai dạng */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const c = raw.replace(/[\s-]/g, '').toUpperCase()
  if (c.length !== CODE_LENGTH) return null
  for (const ch of c) if (!CODE_ALPHABET.includes(ch)) return null
  return c
}

/** Token bí mật của người chơi (lưu trên máy người chơi; server chỉ giữ mã băm) */
export function newToken(): string {
  return randomBytes(24).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function tokenMatches(hash: string | null, token: unknown): boolean {
  if (!hash || typeof token !== 'string' || token.length === 0 || token.length > 128) return false
  const a = Buffer.from(hashToken(token), 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function newSeed(): number {
  return randomInt(1, 2 ** 31 - 1)
}

export function newLinkId(): string {
  return randomBytes(6).toString('base64url')
}
