#!/usr/bin/env node
// Kiểm tra trước khi phát hành (mục 13.3, 15.6, 17). Báo lỗi (thoát mã 1) nếu:
//  - questions.json còn câu hỏi thử ("test": true), hoặc bộ câu hỏi chính thức đang cần câu hỏi
//    thử để lấp một mức độ khó (dưới 2 câu);
//  - questions.json không khớp docs/CAU-HOI-GAME.md (chưa chạy lại npm run import:questions);
//  - bản offline còn mã mạng (build lại bản offline rồi gọi lại kiểm tra của build:offline);
//  - site.json → siteUrl trống / không phải https://…;
//  - ảnh QR (docs/phat-hanh/qr-game.png) hoặc gói offline (phat-hanh/*.zip) cũ so với hiện tại;
//  - src/data/bank-lock.json chưa có băm mã mở Kho câu hỏi, hoặc mã gốc lộ trong mã nguồn / bản build / gói zip.
//
// Dùng: npm run check:release   [--no-build: dùng dist-offline/ có sẵn]
import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { inflateRawSync } from 'node:zlib'
import { networkCodeIn, OFFLINE_FILE } from './check-offline.mjs'
import { runImport, selectTestFill } from './import-questions.mjs'
import { guideText, qrPng, QR_FILE, root, site, ZIP_FILE } from './lib/release.mjs'
import { readZip } from './lib/zip.mjs'
import { LOCK_FILE, lockReady, readLock, scanForLeaks } from './lib/bank-lock.mjs'

const problems = []
const ok = []
const rel = (f) => relative(root, f)

// 1. Câu hỏi thử
const questions = JSON.parse(readFileSync(join(root, 'src/data/questions.json'), 'utf8'))
const tests = questions.filter((q) => q.test === true || /^TEST-/i.test(q.id))
if (tests.length) problems.push(`questions.json còn ${tests.length} câu hỏi thử: ${tests.map((q) => q.id).join(', ')}`)
const pool = JSON.parse(readFileSync(join(root, 'src/data/test-questions.json'), 'utf8')).questions
const { gaps } = selectTestFill(questions.filter((q) => !q.test), pool)
for (const g of gaps) problems.push(`độ khó ${g.difficulty} mới có ${g.official} câu chính thức — cần ít nhất 2 (đang phải dùng câu hỏi thử để lấp)`)
if (!tests.length && !gaps.length) ok.push(`không còn câu hỏi thử (${questions.length} câu chính thức)`)

// 2. questions.json khớp docs/CAU-HOI-GAME.md
const imported = runImport({ inFile: join(root, 'docs/CAU-HOI-GAME.md'), outFile: '', check: true })
if (!imported.ok) problems.push(`docs/CAU-HOI-GAME.md có lỗi:\n    ${imported.messages.join('\n    ')}`)
else if (JSON.stringify(imported.questions) !== JSON.stringify(questions)) problems.push('src/data/questions.json không khớp docs/CAU-HOI-GAME.md — chạy npm run import:questions')
else ok.push('questions.json khớp docs/CAU-HOI-GAME.md')

// 3. Bản offline không có mã mạng
if (!process.argv.includes('--no-build')) execSync('npm run build:offline', { cwd: root, stdio: 'ignore' })
let offlineHtml = null
if (!existsSync(OFFLINE_FILE)) problems.push(`thiếu ${rel(OFFLINE_FILE)} — chạy npm run build:offline`)
else {
  offlineHtml = readFileSync(OFFLINE_FILE)
  const found = networkCodeIn(offlineHtml.toString('utf8'))
  if (found.length) problems.push(`bản offline chứa mã mạng: ${found.join(', ')}`)
  else ok.push('bản offline không có mã mạng')
}

// 4. siteUrl
const url = site.siteUrl ?? ''
if (!/^https:\/\/[^\s/]+\.[^\s]+$/.test(url)) problems.push(`site.json → siteUrl trống hoặc không phải https://… (đang là "${url}")`)
else ok.push(`siteUrl = ${url}`)

// 5. Ảnh QR khớp siteUrl
if (url) {
  if (!existsSync(QR_FILE)) problems.push(`thiếu ${rel(QR_FILE)} — chạy npm run qr`)
  else if (!readFileSync(QR_FILE).equals(await qrPng(url))) problems.push(`${rel(QR_FILE)} không khớp siteUrl hiện tại — chạy npm run qr`)
  else ok.push(`${rel(QR_FILE)} khớp siteUrl`)
}

// 6. Gói offline khớp bản build hiện tại
if (!existsSync(ZIP_FILE)) problems.push(`thiếu ${rel(ZIP_FILE)} — chạy npm run package:offline`)
else if (offlineHtml) {
  const entries = Object.fromEntries(readZip(readFileSync(ZIP_FILE)).map((e) => [e.name, inflateRawSync(e.packed)]))
  const fresh = entries['index.html']?.equals(offlineHtml) && entries['HUONG-DAN.txt']?.equals(Buffer.from(guideText(), 'utf8'))
  if (!fresh) problems.push(`${rel(ZIP_FILE)} cũ so với mã / câu hỏi hiện tại — chạy npm run package:offline`)
  else ok.push(`${rel(ZIP_FILE)} khớp bản offline hiện tại`)
}

// 7. Khóa Kho câu hỏi: có băm, mã gốc không lộ
const lock = readLock()
if (!lockReady(lock)) problems.push(`${rel(LOCK_FILE)} chưa có băm mã mở Kho câu hỏi — chạy npm run set:bank-code -- <mã>`)
else {
  const leaks = await scanForLeaks(lock)
  if (leaks.length) problems.push(`mã mở Kho câu hỏi bị lộ trong: ${leaks.join(', ')} — xóa mã gốc khỏi các file này rồi đổi mã (npm run set:bank-code)`)
  else ok.push('Kho câu hỏi khóa bằng mã (chỉ có băm; mã gốc không có trong mã nguồn, bản build, gói zip)')
}

for (const m of ok) console.log(`✓ ${m}`)
for (const m of problems) console.error(`✗ ${m}`)
console.log(problems.length ? `\nChưa sẵn sàng phát hành: ${problems.length} lỗi.` : '\nSẵn sàng phát hành.')
process.exit(problems.length ? 1 : 0)
