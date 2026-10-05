// Khóa Kho câu hỏi bằng mã (mục 12.8, L5 — 05/10/2026): nhóm chỉ đưa mã cho lớp sau khi chơi xong.
// Repo chỉ giữ SHA-256 của "salt:mã đã chuẩn hóa" (`src/data/bank-lock.json`, đổi bằng
// `npm run set:bank-code -- <mã>`). Mở đúng mã thì Kho mở 10 phút trên máy đó (06/10/2026), máy nhớ
// lúc mở theo băm hiện tại — hết 10 phút hoặc đổi mã là khóa lại.
// Giới hạn: đáp án vẫn nằm trong mã trang (L5); khóa chỉ chặn việc tra cứu thông thường.
import lockJson from '../data/bank-lock.json'
import { load, remove, save } from './storage'
import { sha256Hex } from './sha256'

export interface BankLock {
  salt: string
  hash: string
}

export const UNLOCK_KEY = 'bank.unlock.v1'
export const TRIES_KEY = 'bank.tries.v1'
export const MAX_TRIES = 5
export const WAIT_MS = 30_000
/** mỗi lần nhập đúng mã, Kho mở chừng này rồi tự khóa (06/10/2026) */
export const OPEN_MS = 10 * 60_000

/** khóa đang dùng: `npm run e2e` gắn khóa của mã thử (biến môi trường lúc build), còn lại là file */
export const bankLock: BankLock = __BANK_LOCK_TEST__ ?? lockJson

/** không phân biệt hoa thường, bỏ khoảng trắng hai đầu (giống scripts/lib/bank-lock.mjs) */
export function normalizeCode(code: string): string {
  return code.normalize('NFC').trim().toLowerCase()
}

export function hashCode(code: string, salt: string): string {
  return sha256Hex(`${salt}:${normalizeCode(code)}`)
}

export function codeMatches(code: string, lock: BankLock = bankLock): boolean {
  return lock.hash.length === 64 && normalizeCode(code) !== '' && hashCode(code, lock.salt) === lock.hash
}

interface Opened {
  hash: string
  at: number
}

/** Kho đang mở tới lúc nào (0 = đang khóa). Băm khác (đã đổi mã), quá 10 phút, hoặc giờ máy lùi về trước lúc mở → khóa. */
export function bankOpenUntil(now: number, lock: BankLock = bankLock): number {
  if (lock.hash.length !== 64) return 0
  const o = load<Opened | string | null>(UNLOCK_KEY, null)
  if (!o || typeof o !== 'object' || o.hash !== lock.hash || typeof o.at !== 'number' || o.at > now) return 0
  const until = o.at + OPEN_MS
  return until > now ? until : 0
}

export function isBankUnlocked(lock: BankLock = bankLock, now: number = Date.now()): boolean {
  return bankOpenUntil(now, lock) > 0
}

interface Tries {
  fails: number
  until: number
}

export type UnlockResult = { ok: true } | { ok: false; reason: 'wrong'; left: number } | { ok: false; reason: 'wait'; waitMs: number }

/** thời gian còn phải chờ sau 5 lần sai (0 = nhập được) */
export function unlockWait(now: number): number {
  const t = load<Tries>(TRIES_KEY, { fails: 0, until: 0 })
  return typeof t.until === 'number' && t.until > now ? t.until - now : 0
}

export function tryUnlock(code: string, now: number, lock: BankLock = bankLock): UnlockResult {
  const raw = load<Tries>(TRIES_KEY, { fails: 0, until: 0 })
  const t: Tries = { fails: Number.isInteger(raw.fails) ? raw.fails : 0, until: typeof raw.until === 'number' ? raw.until : 0 }
  if (t.until > now) return { ok: false, reason: 'wait', waitMs: t.until - now }
  if (codeMatches(code, lock)) {
    save(UNLOCK_KEY, { hash: lock.hash, at: now } satisfies Opened)
    remove(TRIES_KEY)
    return { ok: true }
  }
  const fails = t.fails + 1
  if (fails >= MAX_TRIES) {
    save(TRIES_KEY, { fails: 0, until: now + WAIT_MS })
    return { ok: false, reason: 'wait', waitMs: WAIT_MS }
  }
  save(TRIES_KEY, { fails, until: 0 })
  return { ok: false, reason: 'wrong', left: MAX_TRIES - fails }
}
