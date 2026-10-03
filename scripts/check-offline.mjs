#!/usr/bin/env node
// Bản offline (mục 15.6) chỉ có "Chơi trên một máy": không được chứa mã mạng (gọi /api,
// WebSocket, fetch). Chạy sau `vite build --mode offline`.
import { readFileSync } from 'node:fs'

const file = new URL('../dist-offline/index.html', import.meta.url)
const html = readFileSync(file, 'utf8')
const banned = [
  ['/api/', 'đường dẫn API'],
  ['new WebSocket', 'WebSocket'],
  ['fetch(', 'fetch'],
  ['XMLHttpRequest', 'XMLHttpRequest'],
  ['sendBeacon', 'sendBeacon'],
]
const found = banned.filter(([s]) => html.includes(s))
if (found.length) {
  console.error(`Bản offline chứa mã mạng: ${found.map(([, n]) => n).join(', ')}`)
  process.exit(1)
}
console.log('Bản offline không có mã mạng (/api, WebSocket, fetch)')
