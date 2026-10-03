// Chạy server cục bộ: `npm run server` (API + WebSocket ở cổng 8787, kho trong bộ nhớ hoặc
// Redis thật nếu có REDIS_URL / KV_URL). Thêm `--static dist` để phục vụ luôn bản build
// (`npm run serve` = build rồi chạy). Khi phát triển giao diện: `npm run dev` (Vite chuyển /api sang đây).
//   PORT=8787  HOST=0.0.0.0 (để điện thoại cùng Wi-Fi vào được)  SOCKET_MAX_LIFE_MS=300000

import { contextFromEnv } from './context.js'
import { startLocalServer } from './node.js'

const args = process.argv.slice(2)
const staticDir = args.includes('--static') ? (args[args.indexOf('--static') + 1] ?? 'dist') : undefined
const { ctx, missing } = contextFromEnv()
const s = await startLocalServer({
  port: Number(process.env.PORT ?? 8787),
  host: process.env.HOST ?? '127.0.0.1',
  ctx,
  missing,
  staticDir,
  socketMaxLifeMs: process.env.SOCKET_MAX_LIFE_MS !== undefined ? Number(process.env.SOCKET_MAX_LIFE_MS) : 300_000,
})
console.log(`Server: ${s.url}  (kho: ${ctx?.service.store.kind ?? 'chưa có'}${staticDir ? `, trang tĩnh: ${staticDir}` : ''})`)
console.log(`Kiểm tra: ${s.url}/api/health`)
const stop = () => {
  void s.close().then(async () => {
    await ctx?.service.store.close()
    process.exit(0)
  })
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
