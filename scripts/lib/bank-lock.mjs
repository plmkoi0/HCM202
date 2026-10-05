// Khóa Kho câu hỏi phía script (Node): cùng cách chuẩn hóa và băm với src/lib/bankLock.ts.
// Mã gốc không bao giờ được ghi ra file — chỉ salt + SHA-256.
import { createHash, randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root } from './release.mjs'

export const LOCK_FILE = join(root, 'src/data/bank-lock.json')

export const normalizeCode = (code) => code.normalize('NFC').trim().toLowerCase()
export const hashCode = (code, salt) => createHash('sha256').update(`${salt}:${normalizeCode(code)}`, 'utf8').digest('hex')

export function readLock() {
  try {
    const j = JSON.parse(readFileSync(LOCK_FILE, 'utf8'))
    return { salt: String(j.salt ?? ''), hash: String(j.hash ?? '') }
  } catch {
    return { salt: '', hash: '' }
  }
}

/** khóa hợp lệ: salt có giá trị, băm SHA-256 64 ký tự hex */
export const lockReady = (lock) => lock.salt.length >= 8 && /^[0-9a-f]{64}$/.test(lock.hash)

export function writeLock(code) {
  const salt = randomBytes(16).toString('hex')
  const lock = { note: 'Khóa Kho câu hỏi: SHA-256 của "salt:mã" (mã đã bỏ khoảng trắng hai đầu, chữ thường). Đổi mã: npm run set:bank-code -- <mã>. Không ghi mã gốc vào repo.', salt, hash: hashCode(code, salt) }
  writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2) + '\n')
  return lock
}

/**
 * Tìm trong văn bản một "từ" khớp băm khóa — tức mã gốc bị lộ — mà không cần biết mã.
 * Tách theo mọi ký tự không phải chữ / số / - _ . (mã không chứa khoảng trắng ở giữa).
 * Trả số từ khớp (0 = không lộ).
 */
export function leaksCode(text, lock) {
  if (!lockReady(lock)) return 0
  let hits = 0
  const seen = new Set()
  for (const tok of text.split(/[^\p{L}\p{N}\-_.]+/u)) {
    if (tok.length < 3 || tok.length > 64) continue
    // thử cả từ và các phần cắt bỏ dấu chấm / gạch ở hai đầu
    for (const cand of [tok, tok.replace(/^[-_.]+|[-_.]+$/g, '')]) {
      const n = normalizeCode(cand)
      if (seen.has(n)) continue
      seen.add(n)
      if (hashCode(n, lock.salt) === lock.hash) hits++
    }
  }
  return hits
}

const TEXT_EXT = /\.(m?[jt]sx?|json|md|txt|html|css|ya?ml|svg)$/i

/**
 * Quét mã nguồn (file git theo dõi + file mới chưa bỏ qua), dist/, dist-offline/ và gói zip offline
 * tìm mã gốc. Trả danh sách nơi lộ mã (rỗng = an toàn).
 */
export async function scanForLeaks(lock = readLock()) {
  const { execFileSync } = await import('node:child_process')
  const { existsSync, readdirSync, statSync } = await import('node:fs')
  const { inflateRawSync } = await import('node:zlib')
  const { readZip } = await import('./zip.mjs')
  const { ZIP_FILE } = await import('./release.mjs')
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && TEXT_EXT.test(f))
    .map((f) => join(root, f))
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const n of readdirSync(dir)) {
      const p = join(dir, n)
      if (statSync(p).isDirectory()) walk(p)
      else if (TEXT_EXT.test(n)) files.push(p)
    }
  }
  walk(join(root, 'dist'))
  walk(join(root, 'dist-offline'))
  const leaks = []
  for (const f of new Set(files)) {
    if (!existsSync(f)) continue
    if (leaksCode(readFileSync(f, 'utf8'), lock) > 0) leaks.push(f.slice(root.length + 1))
  }
  if (existsSync(ZIP_FILE)) {
    for (const e of readZip(readFileSync(ZIP_FILE))) {
      if (leaksCode(inflateRawSync(e.packed).toString('utf8'), lock) > 0) leaks.push(`phat-hanh/…zip:${e.name}`)
    }
  }
  return leaks
}
