// Mô phỏng tải (mục 17 — Tải và ngắt kết nối): 10 phòng × 5 người + 20 phòng 1 người chơi cùng lúc
// qua HTTP + WebSocket thật, trên nhiều "instance" server dùng chung một kho (giả lập trong bộ
// nhớ, hoặc Redis thật nếu đặt REDIS_URL). Hạn từng pha thu nhỏ để chạy nhanh; kết nối WebSocket
// bị đóng sau 1,5 s (thu nhỏ của 300 s) để thử nối lại; một nửa số máy chỉ dùng polling.
// Kiểm: mọi ván kết thúc, mọi máy cùng thấy trạng thái cuối, không lỗi server, không mất hành động.
// In số lệnh kho theo loại để ước lượng chi phí (mục 15.5).
//
// Dùng: npm run sim:load [-- --guess] [-- --instances 3] [-- --redis]

import { createContext, redisUrlFromEnv } from '../server/context'
import { serverData } from '../server/data'
import { MemoryStore } from '../server/memoryStore'
import { RedisStore } from '../server/redisStore'
import { startLocalServer, type LocalServer } from '../server/node'
import type { RoomStore } from '../server/store'
import type { StateView } from '../server/types'
import { Api, type Session } from '../src/net/api'
import { RoomConnection } from '../src/net/connection'
import { autoPlay, fastData, isBenign, waitFor, type AutoPlayer } from '../tests/netHelpers'

const args = process.argv.slice(2)
const GUESS = args.includes('--guess')
const INSTANCES = Number(args[args.indexOf('--instances') + 1]) || 3
const USE_REDIS = args.includes('--redis')
const BIG_ROOMS = 10
const SOLO_ROOMS = 20
const TIMEOUT_MS = 180_000

const data = fastData(serverData)
/** trạng thái chung của phòng (bỏ phần riêng của từng người xem) */
const norm = (v: StateView | null) => JSON.stringify(v ? { ...v, serverNow: 0, you: '', game: v.game ? { ...v.game, turn: { ...v.game.turn, guesses: {} } } : null } : null)
const answerCount = (id: string) => data.questionById.get(id)?.answers.length ?? 2

async function main() {
  // một kho chung cho mọi instance (mỗi instance một kết nối Redis riêng nếu dùng Redis)
  const shared = new MemoryStore()
  const stores: RoomStore[] = []
  const servers: LocalServer[] = []
  const redisUrl = USE_REDIS ? (process.env.REDIS_URL ?? 'redis://127.0.0.1:6379') : null
  if (USE_REDIS && !redisUrlFromEnv({ REDIS_URL: redisUrl! })) throw new Error('REDIS_URL không hợp lệ')
  for (let i = 0; i < INSTANCES; i++) {
    const store = redisUrl ? new RedisStore(redisUrl) : shared
    stores.push(store)
    servers.push(await startLocalServer({ ctx: createContext(store, { data, limits: { createPerIp: [1000, 60_000], joinPerIp: [1000, 60_000], actionsPerPlayer: [1000, 10_000] } }), socketMaxLifeMs: 1500 }))
  }
  const pick = () => servers[Math.floor(Math.random() * servers.length)]!.url
  // mỗi yêu cầu HTTP tới một instance ngẫu nhiên (như cân bằng tải của Vercel)
  let httpCount = 0
  const lbFetch: typeof fetch = (input, init) => {
    httpCount += 1
    const u = new URL(String(input))
    return fetch(`${pick()}${u.pathname}${u.search}`, init)
  }
  const mkApi = () => new Api(servers[0]!.url, undefined, lbFetch)

  const conns: RoomConnection[] = []
  const players: AutoPlayer[] = []
  const rooms: { code: string; clients: RoomConnection[] }[] = []
  let wsCount = 0
  const open = (s: Session, v: StateView, idx: number) => {
    const useWs = idx % 2 === 0
    if (useWs) wsCount += 1
    // một nửa kết nối WebSocket chủ động thay trước khi bị đóng, nửa kia để bị đóng đột ngột
    const renew = idx % 4 === 0
    const c = new RoomConnection({
      api: mkApi(),
      session: s,
      wsUrl: `${pick().replace('http', 'ws')}/api/ws`,
      onState: () => {},
      WebSocketImpl: useWs ? undefined : null,
      pollMs: 300,
      renewAfterMs: renew ? 900 : 60_000,
      renewHardMs: renew ? 1200 : 60_000,
      safetyPollMs: 3000,
    })
    c.start(v)
    conns.push(c)
    return c
  }

  const t0 = Date.now()
  let idx = 0
  // 10 phòng × 5 người
  for (let r = 0; r < BIG_ROOMS; r++) {
    const api = mkApi()
    const host = await api.create({ name: `Chủ ${r}`, color: 0, capacity: 5, config: { timeLimitMin: null, guessAlong: GUESS } })
    const sessions: { s: Session; v: StateView }[] = [{ s: host, v: host.state }]
    const joins = await Promise.all([1, 2, 3, 4].map((c) => mkApi().join(host.code, { name: `N${r}-${c}`, color: c })))
    for (const j of joins) sessions.push({ s: j, v: j.state })
    const clients = sessions.map((x) => open(x.s, x.v, idx++))
    rooms.push({ code: host.code, clients })
    const ok = await clients[0]!.act({ type: 'START' })
    if (!ok.ok) throw new Error(`START lỗi ${ok.error}`)
    sessions.forEach((x, i) => players.push(autoPlay(clients[i]!, x.s.playerId, data, { guess: GUESS, answerCount })))
  }
  // 20 phòng 1 người (một nửa có 1–2 máy chơi cùng)
  for (let r = 0; r < SOLO_ROOMS; r++) {
    const api = mkApi()
    const bots = r % 2 === 0 ? 0 : 1 + (r % 4 === 1 ? 1 : 0)
    const host = await api.create({ name: `Một ${r}`, color: r % 6, capacity: 1, bots, config: { timeLimitMin: null } })
    const c = open(host, host.state, idx++)
    rooms.push({ code: host.code, clients: [c] })
    players.push(autoPlay(c, host.playerId, data, { answerCount }))
  }
  console.log(`Đã tạo ${rooms.length} phòng, ${conns.length} máy (${wsCount} dùng WebSocket, ${conns.length - wsCount} chỉ polling), ${INSTANCES} instance, kho: ${USE_REDIS ? 'Redis' : 'bộ nhớ'}${GUESS ? ', bật Đoán cùng' : ''}`)

  let failed = false
  try {
    await waitFor(() => conns.every((c) => c.view?.room.status === 'ended'), TIMEOUT_MS, 'mọi ván kết thúc')
  } catch (e) {
    failed = true
    console.error(String(e))
  }
  const elapsed = Date.now() - t0
  for (const p of players) p.stop()
  // mọi máy trong phòng hội tụ về đúng trạng thái trong kho (kết nối vẫn mở nên version còn tăng
  // khi có người nối lại — đọc lại kho tới khi khớp)
  const converged = new Set<string>()
  let mismatch = 0
  const until = Date.now() + 20_000
  while (converged.size < rooms.length && Date.now() < until) {
    for (const r of rooms) {
      if (converged.has(r.code)) continue
      const v = await stores[0]!.version(r.code)
      if (!r.clients.every((c) => c.view?.version === v)) continue
      converged.add(r.code)
      const first = norm(r.clients[0]!.view)
      if (r.clients.some((c) => norm(c.view) !== first)) mismatch += 1
    }
    await new Promise((res) => setTimeout(res, 20))
  }
  if (converged.size < rooms.length) {
    failed = true
    for (const r of rooms) {
      if (converged.has(r.code)) continue
      console.error(`  ${r.code} chưa hội tụ: kho v${await stores[0]!.version(r.code)} — máy ${r.clients.map((c) => `${c.view?.version}/${c.mode}`).join(', ')}`)
    }
  }
  const finalOf = new Map<string, number>()
  for (const r of rooms) finalOf.set(r.code, (await stores[0]!.version(r.code)) ?? 0)

  const errors: Record<string, number> = {}
  const errorsBy: Record<string, number> = {}
  let sent = 0
  for (const p of players) {
    sent += p.sent
    for (const [k, v] of Object.entries(p.errors)) errors[k] = (errors[k] ?? 0) + v
    for (const [k, v] of Object.entries(p.errorsBy)) errorsBy[k] = (errorsBy[k] ?? 0) + v
  }
  const bad = Object.entries(errors).filter(([k]) => !isBenign(k))
  const finishedRooms = rooms.filter((r) => r.clients[0]!.view?.game?.ended).length
  const totalVersions = [...finalOf.values()].reduce((a, b) => a + b, 0)
  const cmd: Record<string, number> = {}
  let received = 0
  for (const s of new Set(stores)) {
    const st = s.stats()
    received += st.received
    for (const [k, v] of Object.entries(st.commands)) cmd[k] = (cmd[k] ?? 0) + v
  }
  const totalCmd = Object.entries(cmd).filter(([k]) => !k.startsWith('(')).reduce((a, [, b]) => a + b, 0)

  console.log(`\nKết quả sau ${(elapsed / 1000).toFixed(1)} s:`)
  console.log(`- Ván kết thúc: ${finishedRooms}/${rooms.length}; phòng có máy thấy khác nhau: ${mismatch}`)
  console.log(`- Hành động người chơi gửi: ${sent}; lỗi vô hại (đua nhau): ${JSON.stringify(Object.fromEntries(Object.entries(errors).filter(([k]) => isBenign(k))))}`)
  if (args.includes('--verbose')) console.log(`  theo hành động: ${JSON.stringify(errorsBy)}`)
  console.log(`- Lỗi cần xem: ${bad.length ? JSON.stringify(Object.fromEntries(bad)) : 'không có'}`)
  console.log(`- Yêu cầu HTTP: ${httpCount}; số lần ghi phòng (tổng version): ${totalVersions}`)
  console.log(`- Lệnh kho: ${totalCmd} (${Object.entries(cmd).map(([k, v]) => `${k} ${v}`).join(', ')}); tin pub/sub nhận: ${received}`)
  console.log(`- Lệnh kho trên mỗi lần ghi phòng: ${(totalCmd / Math.max(1, totalVersions)).toFixed(2)} (polling 0,3 s trong mô phỏng — thật là 1,5 s)`)

  for (const c of conns) c.stop()
  for (const s of servers) await s.close()
  // chờ các lần ghi "đóng kết nối" còn dở rồi mới đóng kho
  await new Promise((r) => setTimeout(r, 500))
  for (const s of new Set(stores)) await s.close()
  if (failed || bad.length > 0 || mismatch > 0 || finishedRooms !== rooms.length) {
    console.error('\nMÔ PHỎNG TẢI KHÔNG ĐẠT')
    process.exit(1)
  }
  console.log('\nMô phỏng tải đạt')
}

await main()
