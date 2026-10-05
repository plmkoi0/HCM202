#!/usr/bin/env node
// Đổi mã mở Kho câu hỏi: npm run set:bank-code -- <mã>
// Ghi salt mới + SHA-256 vào src/data/bank-lock.json. Mã gốc không được in ra hay ghi vào file nào.
// Đổi mã thì mọi máy đã mở Kho bị khóa lại (máy nhớ theo băm).
import { relative } from 'node:path'
import { LOCK_FILE, normalizeCode, writeLock } from './lib/bank-lock.mjs'
import { root } from './lib/release.mjs'

const code = process.argv.slice(2).join(' ')
if (normalizeCode(code).length < 4) {
  console.error('Dùng: npm run set:bank-code -- <mã>   (mã ít nhất 4 ký tự, không phân biệt hoa thường)')
  process.exit(2)
}
writeLock(code)
console.log(`Đã ghi băm mã mới vào ${relative(root, LOCK_FILE)} (không lưu mã gốc).`)
console.log('Tiếp theo: npm run package:offline (gói offline mang khóa mới), npm run check:release, rồi commit và đẩy lên nhánh game.')
