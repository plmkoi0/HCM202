#!/usr/bin/env node
// Bản offline (mục 15.6) chỉ có "Chơi trên một máy": không được chứa mã mạng (gọi /api,
// WebSocket, fetch). Chạy sau `vite build --mode offline`; check:release gọi lại hàm này.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BANNED = [
  ['/api/', 'đường dẫn API'],
  ['new WebSocket', 'WebSocket'],
  ['fetch(', 'fetch'],
  ['XMLHttpRequest', 'XMLHttpRequest'],
  ['sendBeacon', 'sendBeacon'],
]

export const OFFLINE_FILE = fileURLToPath(new URL('../dist-offline/index.html', import.meta.url))

/** Danh sách loại mã mạng tìm thấy trong HTML bản offline (rỗng = đạt) */
export function networkCodeIn(html) {
  return BANNED.filter(([s]) => html.includes(s)).map(([, n]) => n)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const found = networkCodeIn(readFileSync(OFFLINE_FILE, 'utf8'))
  if (found.length) {
    console.error(`Bản offline chứa mã mạng: ${found.join(', ')}`)
    process.exit(1)
  }
  console.log('Bản offline không có mã mạng (/api, WebSocket, fetch)')
}
