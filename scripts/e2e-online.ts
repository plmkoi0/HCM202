// Chạy thử "Chơi qua phòng" nhiều máy (mục 17): server cục bộ (kho bộ nhớ, hạn rút ngắn) phục vụ bản
// build dist/, 3 trang trình duyệt riêng (3 người): tạo phòng, vào bằng link /p/ABCDE và bằng mã,
// bắt đầu, chơi tới kết thúc; giữa ván một máy mất mạng rồi có mạng lại, một máy tải lại trang
// (nối lại bằng phiên đã lưu); cuối cùng Chơi lại → cả 3 về phòng chờ.
//
// Dùng: npm run build && npm run e2e:online [-- --shots <thư mục>]
//       npm run e2e:online -- --url https://ten-du-an.vercel.app   (chạy trên bản deploy thật: hạn thật,
//       chọn 5 phút; không cắt được WebSocket phía server nên chỉ ngắt mạng của trình duyệt)

import { createHash, X509Certificate } from 'node:crypto'
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { chromium, type Page } from 'playwright-core'
import { createContext } from '../server/context'
import { serverData } from '../server/data'
import { MemoryStore } from '../server/memoryStore'
import { startLocalServer } from '../server/node'
import { fastData } from '../tests/netHelpers'

const args = process.argv.slice(2)
const shots = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null
const remote = args.includes('--url') ? args[args.indexOf('--url') + 1]!.replace(/\/$/, '') : null
if (shots) mkdirSync(shots, { recursive: true })
const root = join(import.meta.dirname, '..')
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

const failures: string[] = []
const check = (ok: boolean, msg: string) => {
  if (!ok) failures.push(msg)
  console.log(`${ok ? '✓' : '✗'} ${msg}`)
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function axe(page: Page, name: string) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity), null, { timeout: 3000 }).catch(() => {})
  await page.addScriptTag({ content: axeSource })
  const res = await page.evaluate(async () => {
    // @ts-expect-error axe nạp vào trang
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
    return (r.violations as { id: string; nodes: { target: string[] }[] }[]).map((v) => `${v.id}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
  })
  check(res.length === 0, `${name}: axe không lỗi${res.length ? ` — ${res.join(' ; ')}` : ''}`)
}

const visible = async (_p: Page, sel: ReturnType<Page['locator']>) => (await sel.count()) > 0 && (await sel.first().isVisible().catch(() => false))

/** Một bước "người chơi tự động" trên trang: bấm những gì đến lượt mình bấm */
async function step(p: Page): Promise<void> {
  const answers = p.locator('button[data-answer]:enabled')
  if ((await answers.count()) > 0) {
    await answers.nth(Math.floor(Math.random() * (await answers.count()))).click({ timeout: 1000 }).catch(() => {})
    return
  }
  for (const name of [/^Tung xúc xắc$/, /^Tiếp tục$/, /^Bỏ món mới/, /^Ngựa \d/]) {
    const b = p.getByRole('button', { name }).and(p.locator(':enabled'))
    if (await visible(p, b)) {
      await b.first().click({ timeout: 1000 }).catch(() => {})
      return
    }
  }
}

const server = remote
  ? { url: remote, dropSockets: () => 0, close: async () => {} }
  : await startLocalServer({ ctx: createContext(new MemoryStore(), { data: fastData(serverData, 0.2) }), staticDir: join(root, 'dist'), socketMaxLifeMs: 25_000 })
if (remote) console.log(`  chạy trên ${remote}`)
// bản deploy: đi qua proxy HTTPS của môi trường (nếu có), như mọi công cụ khác. Proxy giải mã lại
// TLS bằng CA riêng → E2E_PROXY_CA = đường dẫn chứng chỉ CA đó; Chromium chỉ tin thêm đúng khóa CA này.
const proxy = remote && process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined
const caPath = remote ? process.env.E2E_PROXY_CA : undefined
const spki = caPath ? createHash('sha256').update(new X509Certificate(readFileSync(caPath)).publicKey.export({ type: 'spki', format: 'der' })).digest('base64') : null
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  proxy,
  args: spki ? [`--ignore-certificate-errors-spki-list=${spki}`] : [],
})
const errors: string[] = []
const pages: Page[] = []
const contexts = []
for (const [i, vp] of [
  [0, { width: 1280, height: 800 }],
  [1, { width: 390, height: 844 }],
  [2, { width: 768, height: 1024 }],
] as const) {
  const c = await browser.newContext({ viewport: vp, reducedMotion: 'reduce', colorScheme: i === 1 ? 'dark' : 'light' })
  contexts.push(c)
  const p = await c.newPage()
  p.on('pageerror', (e) => errors.push(`trang ${i + 1}: ${e}`))
  p.on('console', (m) => {
    // lỗi mạng lúc cố ý ngắt mạng là bình thường
    if (m.type() === 'error' && !/net::ERR_INTERNET_DISCONNECTED|Failed to load resource|WebSocket/.test(m.text())) errors.push(`trang ${i + 1}: ${m.text()}`)
  })
  p.on('dialog', (d) => void d.accept())
  pages.push(p)
}
const [host, g2, g3] = pages as [Page, Page, Page]

// 1. chủ phòng tạo phòng 3 người
await host.goto(server.url)
await axe(host, 'trang chủ (bản online)')
await host.getByRole('button', { name: 'Tạo phòng' }).click()
await host.getByLabel('Biệt danh').fill('Lan')
await host.locator('label.seg', { hasText: /^3$/ }).first().click()
await host.getByLabel(/Đoán cùng/).check()
// bản deploy: hạn thật → chọn mốc 5 phút để ván kết thúc theo giờ nếu chưa ai về đích
if (remote) await host.locator('label.seg', { hasText: /^5 phút$/ }).first().click()
await axe(host, 'tạo phòng')
await host.getByRole('button', { name: 'Tạo phòng' }).click()
await host.locator('[data-room-code]').waitFor()
const code = (await host.locator('[data-room-code]').getAttribute('data-room-code'))!
check(/^[A-Z2-9]{5}$/.test(code), `tạo phòng được mã ${code}`)
check(await visible(host, host.getByRole('img', { name: new RegExp(`Mã QR vào phòng ${code}`) })), 'phòng chờ có mã QR')

// 2. người 2 mở link mời /p/CODE
await g2.goto(`${server.url}/p/${code}`)
await g2.getByLabel('Biệt danh').waitFor()
await g2.getByLabel('Biệt danh').fill('Minh')
await g2.getByRole('button', { name: 'Vào phòng' }).click()
await g2.locator('[data-room-status="lobby"]').waitFor()
check(true, 'vào phòng bằng link /p/ABCDE')

// 3. người 3 nhập mã; thử mã sai trước (báo lỗi tiếng Việt)
await g3.goto(server.url)
await g3.getByRole('button', { name: 'Vào phòng' }).click()
await g3.getByLabel('Mã phòng').fill('ZZZZZ')
await g3.getByRole('button', { name: 'Tìm phòng' }).click()
check(await g3.getByRole('alert').filter({ hasText: 'Không tìm thấy phòng' }).waitFor({ timeout: 5000 }).then(() => true, () => false), 'mã sai → "Không tìm thấy phòng…"')
await g3.getByLabel('Mã phòng').fill(code.toLowerCase())
await g3.getByRole('button', { name: 'Tìm phòng' }).click()
await g3.getByLabel('Biệt danh').fill('Hoa')
await axe(g3, 'vào phòng')
await g3.getByRole('button', { name: 'Vào phòng' }).click()
await g3.locator('[data-room-status="lobby"]').waitFor()
check(true, 'vào phòng bằng mã (chữ thường cũng được)')
await host.getByText('Người chơi 3/3').waitFor()
check(true, 'chủ phòng thấy 3/3 người')
await axe(host, 'phòng chờ')
if (shots) await host.screenshot({ path: join(shots, 'lobby.png'), fullPage: true })

// 4. bắt đầu, chơi; giữa chừng người 2 mất mạng rồi có lại, người 3 tải lại trang
await host.getByRole('button', { name: 'Bắt đầu' }).click()
await Promise.all(pages.map((p) => p.locator('[data-room-status="playing"]').waitFor()))
check(true, 'cả 3 máy vào ván')
// không có Kho câu hỏi (đã bỏ); Menu chỉ có Luật chơi + Cài đặt
check((await host.getByRole('button', { name: 'Kho câu hỏi' }).count()) === 0, 'trong phòng không có nút Kho câu hỏi')
await host.getByRole('button', { name: 'Menu' }).click()
check(await visible(host, host.getByRole('dialog').getByRole('tab', { name: 'Cài đặt' })), 'Menu trong ván có Luật chơi + Cài đặt')
await host.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click()
await axe(host, 'bàn cờ (chơi qua phòng)')
const t0 = Date.now()
let disconnected = false
let reloaded = false
let sawOffline = false
let sawRecover = false
while (Date.now() - t0 < (remote ? 480_000 : 300_000)) {
  if ((await Promise.all(pages.map((p) => p.locator('[data-room-status="ended"]').count()))).every((n) => n > 0)) break
  await Promise.all(pages.map((p) => step(p)))
  const el = Date.now() - t0
  if (!disconnected && el > 8000) {
    disconnected = true
    await contexts[1]!.setOffline(true)
    // đóng hẳn WebSocket của máy này phía server (như mất sóng)
    server.dropSockets()
  }
  if (disconnected && !sawRecover && el > (remote ? 30_000 : 16_000)) {
    sawOffline = (await g2.locator('[data-conn="offline"], [data-conn="poll"]').count()) > 0
    await contexts[1]!.setOffline(false)
    sawRecover = true
  }
  if (!reloaded && el > (remote ? 40_000 : 24_000)) {
    reloaded = true
    await g3.reload()
    await g3.locator('[data-room-status]').waitFor({ timeout: 10_000 })
  }
  await sleep(150)
}
check(sawOffline, 'máy mất mạng hiện "Mất kết nối — đang thử lại" / chế độ dự phòng')
const ended = (await Promise.all(pages.map((p) => p.locator('[data-room-status="ended"]').count()))).every((n) => n > 0)
check(ended, `chơi tới kết thúc trên cả 3 máy (${Math.round((Date.now() - t0) / 1000)} s)`)
await sleep(1500)
const versions = await Promise.all(pages.map((p) => p.locator('[data-room-version]').getAttribute('data-room-version')))
check(new Set(versions).size === 1, `3 máy cùng trạng thái cuối (version ${versions.join(', ')})`)
if (remote) {
  // Chromium trong môi trường có proxy chặn TLS không nâng cấp được WebSocket (proxy bỏ header Upgrade);
  // WebSocket thật được check:deploy kiểm bằng Node → ở đây chỉ đòi máy đã có kết nối lại
  check(await visible(g2, g2.locator('[data-conn="ws"], [data-conn="poll"]')), `máy từng mất mạng đã có kết nối lại (${await g2.locator('[data-conn]').first().getAttribute('data-conn')})`)
} else check(await visible(g2, g2.locator('[data-conn="ws"]')), 'máy từng mất mạng đã nối lại WebSocket ("Trực tiếp")')
check(await visible(g3, g3.locator('[data-room-status="ended"]')), 'máy tải lại trang vẫn về đúng phòng (phiên đã lưu)')
await axe(host, 'kết thúc (chơi qua phòng)')
if (shots) await g2.screenshot({ path: join(shots, 'end-mobile.png'), fullPage: true })

// 5. chơi lại: người không phải chủ phòng không bấm được; chủ phòng bấm → cả 3 về phòng chờ
check(await g2.getByRole('button', { name: 'Chơi lại (về phòng chờ)' }).isDisabled(), 'chỉ chủ phòng bấm Chơi lại')
await host.getByRole('button', { name: 'Chơi lại (về phòng chờ)' }).click()
const back = await Promise.all(pages.map((p) => p.locator('[data-room-status="lobby"]').waitFor({ timeout: 10_000 }).then(() => true, () => false)))
check(back.every(Boolean), 'Chơi lại → cả 3 về phòng chờ cùng phòng')

// 6. chủ phòng rời → người vào sớm nhất còn kết nối thành chủ phòng
await host.getByRole('button', { name: 'Rời phòng' }).first().click()
await host.getByRole('dialog').getByRole('button', { name: 'Rời phòng' }).click()
check(await g2.getByRole('button', { name: 'Bắt đầu' }).waitFor({ timeout: 10_000 }).then(() => true, () => false), 'chủ phòng rời → quyền chuyển cho người vào sớm nhất (Minh)')

check(errors.length === 0, `không lỗi trang${errors.length ? ` — ${errors.slice(0, 3).join(' | ')}` : ''}`)
await browser.close()
await server.close()
console.log(failures.length ? `\n${failures.length} kiểm tra không đạt` : '\nTất cả kiểm tra đạt')
process.exit(failures.length ? 1 : 0)
