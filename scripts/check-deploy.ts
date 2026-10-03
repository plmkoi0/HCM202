// Kiểm tra server trên bản deploy thật (mục 15.4 — chỉ kiểm được khi có deploy trên Vercel):
//  1. /api/health: kho Redis đã gắn
//  2. WebSocket nối được (experimental_upgradeWebSocket chạy trên Vercel)
//  3. polling dự phòng chạy (một máy chỉ dùng polling)
//  4. (--long) Vercel đóng kết nối WebSocket ở ~300 s; client tự nối lại, không mất trạng thái
// Tạo một phòng thử (2 người), chơi vài lượt tự động, rồi rời phòng.
//
// Dùng:  npm run check:deploy -- https://ten-du-an.vercel.app [--long] [--bypass <mã>]
//   --bypass: mã "Protection Bypass for Automation" nếu kiểm link deploy thử có Deployment Protection

import { Api } from '../src/net/api'
import { RoomConnection, type ConnectionMode } from '../src/net/connection'
import type { StateView } from '../server/types'

const args = process.argv.slice(2)
const base = args.find((a) => /^https?:\/\//.test(a))?.replace(/\/$/, '')
const LONG = args.includes('--long')
/** chạy thử với server cục bộ (kho trong bộ nhớ) */
const LOCAL = args.includes('--local')
const LIFE_MS = LOCAL ? 6000 : 300_000
const bypass = args.includes('--bypass') ? args[args.indexOf('--bypass') + 1] : undefined
if (!base) {
  console.error('Dùng: npm run check:deploy -- https://ten-du-an.vercel.app [--long] [--bypass <mã>]')
  process.exit(2)
}

const failures: string[] = []
const check = (ok: boolean, msg: string) => {
  if (!ok) failures.push(msg)
  console.log(`${ok ? '✓' : '✗'} ${msg}`)
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
async function waitFor(cond: () => boolean, ms: number): Promise<boolean> {
  const until = Date.now() + ms
  while (!cond()) {
    if (Date.now() > until) return false
    await sleep(50)
  }
  return true
}

const headers: Record<string, string> = bypass ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-set-bypass-cookie': 'true' } : {}
const fetchWithBypass: typeof fetch = (input, init) => fetch(input, { ...init, headers: { ...(init?.headers as Record<string, string>), ...headers } })

class BypassWebSocket extends WebSocket {
  constructor(url: string | URL) {
    // WebSocket của trình duyệt / Node không gửi header tùy ý → dùng tham số truy vấn của Vercel
    const u = new URL(url)
    if (bypass) u.searchParams.set('x-vercel-protection-bypass', bypass)
    super(u)
  }
}

const api = new Api(base, undefined, fetchWithBypass)
const h = await api.health().catch((e: unknown) => ({ ok: false, store: String(e), pingMs: null }))
check(h.ok && (h.store === 'redis' || LOCAL), `/api/health: ok=${h.ok}, kho=${h.store}, ping ${h.pingMs ?? '?'} ms`)
if (!h.ok) {
  console.error('\nServer chưa sẵn sàng — xem docs/HUONG-DAN-VERCEL.md (bước gắn Redis, deploy lại).')
  process.exit(1)
}

const host = await api.create({ name: 'Kiểm tra', color: 0, capacity: 2, config: { timeLimitMin: 5 } })
const guest = await api.join(host.code, { name: 'Polling', color: 1 })
console.log(`  phòng thử: ${host.code}`)
const modesA: ConnectionMode[] = []
const modesB: ConnectionMode[] = []
// --long: tắt việc chủ động thay kết nối để thấy Vercel tự đóng ở 300 s
const a = new RoomConnection({
  api,
  session: host,
  onState: () => {},
  onMode: (m) => modesA.push(m),
  WebSocketImpl: BypassWebSocket as unknown as typeof WebSocket,
  renewAfterMs: LONG ? 3_600_000 : 280_000,
  renewHardMs: LONG ? 3_600_000 : 290_000,
})
const wsOpens = () => modesA.filter((m) => m === 'ws').length
const b = new RoomConnection({ api, session: guest, onState: () => {}, onMode: (m) => modesB.push(m), WebSocketImpl: null })
a.start(host.state)
b.start(guest.state)
check(await waitFor(() => a.mode === 'ws', 10_000), 'WebSocket nối được (experimental_upgradeWebSocket)')
check(await waitFor(() => b.view !== null && b.mode === 'poll', 5000), 'polling dự phòng chạy')

const r = await a.act({ type: 'START' })
check(r.ok, 'bắt đầu ván qua HTTP')
const started = Date.now()
// chơi tự động vài lượt
const play = async (c: RoomConnection, me: string) => {
  const v: StateView | null = c.view
  const g = v?.game
  if (!g || g.phase === 'ended' || g.order[g.turnIndex] !== me) return
  if (g.phase === 'roll') await c.act({ type: 'ROLL' })
  else if (g.phase === 'question') await c.act({ type: 'ANSWER', choice: g.turn.question!.order[0]! })
  else if (g.phase === 'reveal') await c.act({ type: 'NEXT_TURN' })
  else if (g.phase === 'chooseHorse') await c.act({ type: 'CHOOSE_HORSE', horse: 0 })
  else if (g.phase === 'discard') await c.act({ type: 'DISCARD_POWERUP', discard: 'new' })
}
const until = Date.now() + 20_000
while (Date.now() < until) {
  await play(a, host.playerId)
  await play(b, guest.playerId)
  await sleep(400)
}
const va = a.view!
check(va.game!.turnNumber >= 2, `chơi được qua mạng (lượt ${va.game!.turnNumber})`)
check(await waitFor(() => b.view?.version === a.view?.version, 5000), 'máy WebSocket và máy polling cùng trạng thái')

if (LONG) {
  console.log(`  chờ server đóng kết nối WebSocket (~${LIFE_MS / 1000} s)…`)
  const before = wsOpens()
  const ok = await waitFor(() => wsOpens() > before, LIFE_MS + 30_000)
  check(ok, `server đóng kết nối WebSocket và client tự nối lại (đã mở ${wsOpens()} kết nối trong ${Math.round((Date.now() - started) / 1000)} s)`)
  check(await waitFor(() => b.view?.version === a.view?.version, 5000), 'sau khi nối lại: vẫn cùng trạng thái')
}

await a.act({ type: 'LEAVE' })
await b.act({ type: 'LEAVE' })
a.stop()
b.stop()
console.log(failures.length ? `\n${failures.length} kiểm tra không đạt` : '\nBản deploy đạt')
process.exit(failures.length ? 1 : 0)
