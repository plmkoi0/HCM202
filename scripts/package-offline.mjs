#!/usr/bin/env node
// Đóng gói bản offline (mục 15.6): build offline một file rồi nén thành
// phat-hanh/HCM202-Con-duong-tu-tuong.zip gồm index.html + HUONG-DAN.txt.
// Gói được commit vào nhánh game để nhóm tải từ GitHub — chạy lại mỗi khi đổi câu hỏi hoặc mã.
//
// Dùng: npm run package:offline   (tự chạy npm run build:offline trước)
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'
import { networkCodeIn, OFFLINE_FILE } from './check-offline.mjs'
import { makeZip } from './lib/zip.mjs'
import { guideText, root, ZIP_FILE } from './lib/release.mjs'

if (!process.argv.includes('--no-build')) execSync('npm run build:offline', { cwd: root, stdio: 'inherit' })
const html = readFileSync(OFFLINE_FILE)
const found = networkCodeIn(html.toString('utf8'))
if (found.length) {
  console.error(`Bản offline chứa mã mạng (${found.join(', ')}) — không đóng gói.`)
  process.exit(1)
}
const zip = makeZip([
  { name: 'index.html', data: html },
  { name: 'HUONG-DAN.txt', data: Buffer.from(guideText(), 'utf8') },
])
mkdirSync(dirname(ZIP_FILE), { recursive: true })
writeFileSync(ZIP_FILE, zip)
console.log(`Đã đóng gói ${relative(root, ZIP_FILE)} (${(zip.length / 1024).toFixed(0)} KB; index.html ${(html.length / 1024).toFixed(0)} KB).`)
