// Khóa Kho câu hỏi bằng mã (mục 12.8, L5 — 05/10/2026)
import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { codeMatches, hashCode, isBankUnlocked, MAX_TRIES, tryUnlock, unlockWait, WAIT_MS, type BankLock } from '../src/lib/bankLock'
import { sha256Hex } from '../src/lib/sha256'
import { hashCode as nodeHash, leaksCode, lockReady, readLock, scanForLeaks } from '../scripts/lib/bank-lock.mjs'

class MemoryStorage {
  m = new Map<string, string>()
  getItem(k: string) {
    return this.m.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.m.set(k, v)
  }
  removeItem(k: string) {
    this.m.delete(k)
  }
}

// mã thử chỉ dùng trong test (không phải mã thật)
const salt = 'salt-thu-1234'
const lock: BankLock = { salt, hash: hashCode('Ma-Thu-77', salt) }

describe('SHA-256 thuần JS', () => {
  it('khớp node:crypto với chuỗi rỗng, tiếng Việt, chuỗi dài nhiều khối', () => {
    for (const s of ['', 'abc', 'Kho câu hỏi — Đúng / Sai', 'x'.repeat(55), 'y'.repeat(56), 'z'.repeat(64), 'Đ'.repeat(300)]) {
      expect(sha256Hex(s)).toBe(createHash('sha256').update(s, 'utf8').digest('hex'))
    }
  })
  it('băm phía trình duyệt và phía script giống nhau', () => {
    expect(hashCode('  Ma-Thu-77 ', salt)).toBe(nodeHash('ma-thu-77', salt))
  })
})

describe('mở Kho bằng mã', () => {
  beforeEach(() => {
    ;(globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage()
  })
  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage
  })

  it('mã đúng mở được, kể cả khác hoa thường và có khoảng trắng hai đầu; mã sai không mở', () => {
    expect(codeMatches('ma-thu-77', lock)).toBe(true)
    expect(codeMatches('  MA-THU-77  ', lock)).toBe(true)
    expect(codeMatches('ma-thu-78', lock)).toBe(false)
    expect(codeMatches('', lock)).toBe(false)
    expect(isBankUnlocked(lock)).toBe(false)
    expect(tryUnlock('sai', 0, lock)).toEqual({ ok: false, reason: 'wrong', left: MAX_TRIES - 1 })
    expect(isBankUnlocked(lock)).toBe(false)
    expect(tryUnlock('Ma-thu-77', 0, lock)).toEqual({ ok: true })
    expect(isBankUnlocked(lock)).toBe(true)
  })

  it('đổi băm (đổi mã) thì máy đã mở bị khóa lại', () => {
    tryUnlock('ma-thu-77', 0, lock)
    expect(isBankUnlocked(lock)).toBe(true)
    const other: BankLock = { salt: 'salt-moi-5678', hash: hashCode('ma-moi', 'salt-moi-5678') }
    expect(isBankUnlocked(other)).toBe(false)
  })

  it('sai 5 lần thì chờ 30 giây — trong lúc chờ mã đúng cũng không mở', () => {
    for (let i = 1; i < MAX_TRIES; i++) expect(tryUnlock('sai', 1000, lock)).toMatchObject({ ok: false, reason: 'wrong' })
    expect(tryUnlock('sai', 1000, lock)).toEqual({ ok: false, reason: 'wait', waitMs: WAIT_MS })
    expect(unlockWait(1000 + 10_000)).toBe(WAIT_MS - 10_000)
    expect(tryUnlock('ma-thu-77', 1000 + 10_000, lock)).toMatchObject({ ok: false, reason: 'wait' })
    expect(isBankUnlocked(lock)).toBe(false)
    expect(unlockWait(1000 + WAIT_MS)).toBe(0)
    expect(tryUnlock('ma-thu-77', 1000 + WAIT_MS, lock)).toEqual({ ok: true })
  })
})

describe('mã gốc không nằm trong repo hay bản build', () => {
  it('bank-lock.json có salt và băm SHA-256', () => {
    expect(lockReady(readLock())).toBe(true)
  })
  it('bộ dò bắt được mã nếu bị ghi vào văn bản', () => {
    expect(leaksCode('const x = "MA-THU-77";', lock)).toBe(1)
    expect(leaksCode('mã: ma-thu-77.', lock)).toBe(1)
    expect(leaksCode('không có gì ở đây', lock)).toBe(0)
  })
  it('mã nguồn, docs, dist/, dist-offline/ và gói zip không chứa mã gốc', async () => {
    expect(await scanForLeaks()).toEqual([])
  })
})
