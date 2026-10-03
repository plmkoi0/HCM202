#!/usr/bin/env node
// Chạy thử "Chơi trên một máy" trong Chromium thật (playwright-core): chơi trọn ván qua giao
// diện, ở 360 × 780 và 1366 × 768. Kiểm: không lỗi console, không request mạng ra ngoài,
// không cuộn ngang, tải lại → "Tiếp tục ván", hoàn tác.
//
// Dùng: npm run build:offline && node scripts/e2e-local.mjs [--url <địa chỉ>] [--shots <thư mục>] [--motion]
//   --motion  bật hiệu ứng (mặc định giả lập prefers-reduced-motion để chạy nhanh)
//   mặc định mở file://…/dist-offline/index.html (bản offline)

import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const arg = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d)
const url = arg('--url', pathToFileURL(join(root, 'dist-offline/index.html')).href)
const shots = arg('--shots', null)
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'
if (shots) mkdirSync(shots, { recursive: true })

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const failures = []
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
  console.log(`${ok ? '✓' : '✗'} ${msg}`)
}

/** Kiểm tra trợ năng bằng axe-core (WCAG 2 A/AA: tương phản, nhãn, vai trò…) */
async function axeCheck(page, name) {
  // chờ hiệu ứng có hạn (cửa sổ trượt lên, mờ dần) chạy xong — giữa chừng chữ còn trong suốt
  await page
    .waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity), null, { timeout: 3000 })
    .catch(() => {})
  await page.addScriptTag({ content: axeSource })
  const res = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
    return r.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)
  })
  check(res.length === 0, `${name}: axe không lỗi${res.length ? ` — ${res.join(' ; ')}` : ''}`)
}

async function visible(loc) {
  return (await loc.count()) > 0 && (await loc.first().isVisible())
}

async function play(page, { maxSteps = 4000, pick = 'random', label, axe = false }) {
  let answered = 0
  let chose = 0
  let shotQ = false
  let axedQ = !axe
  let axedR = !axe
  for (let i = 0; i < maxSteps; i++) {
    if (await visible(page.getByRole('button', { name: 'Chơi lại' }))) return { done: true, answered, chose }
    const answers = page.locator('button[data-answer]:enabled')
    if ((await answers.count()) > 0) {
      if (shots && !shotQ) {
        await page.screenshot({ path: join(shots, `${label}-question.png`) })
        shotQ = true
      }
      if (!axedQ) {
        await axeCheck(page, `${label} câu hỏi`)
        axedQ = true
      }
      const n = await answers.count()
      await answers.nth(pick === 'first' ? 0 : Math.floor(Math.random() * n)).click()
      answered++
      continue
    }
    const roll = page.getByRole('button', { name: 'Tung xúc xắc' })
    if (await visible(roll)) {
      await roll.click()
      continue
    }
    if (!axedR && (await visible(page.getByText('Giải thích')))) {
      await axeCheck(page, `${label} giải thích`)
      axedR = true
    }
    for (const name of [/^Tiếp tục$/, /^Bỏ món mới/]) {
      const b = page.getByRole('button', { name }).and(page.locator(':enabled'))
      if (await visible(b)) {
        await b.first().click({ timeout: 2000 }).catch(() => {})
        break
      }
    }
    const horse = page.getByRole('button', { name: /^Ngựa \d/ })
    if (await visible(horse)) {
      await horse.first().click()
      chose++
    }
    await page.clock.runFor(700)
  }
  return { done: false, answered, chose }
}

const browser = await chromium.launch({ executablePath })
for (const [w, h, scheme] of [
  [360, 780, 'light'],
  [1366, 768, 'dark'],
]) {
  const label = `${w}x${h}-${scheme}`
  const context = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: args.includes('--motion') ? 'no-preference' : 'reduce' })
  const page = await context.newPage()
  const errors = []
  const external = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  // ván đang chơi có hộp hỏi "rời trang?" (beforeunload) — đồng ý để tải lại được
  let leaveAsked = 0
  page.on('dialog', (d) => {
    if (d.type() === 'beforeunload') leaveAsked++
    void d.accept()
  })
  page.on('request', (r) => {
    const u = r.url()
    if (!u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith(url.replace(/[^/]*$/, ''))) external.push(u)
  })
  await page.clock.install()
  await page.goto(url)
  await axeCheck(page, `${label} trang chủ`)
  await page.getByRole('button', { name: 'Chơi trên một máy' }).click()
  // 2 người + 2 máy
  await page.getByRole('button', { name: 'Thêm người' }).click()
  await page.getByRole('button', { name: 'Máy chơi cùng +' }).click()
  await page.getByRole('button', { name: 'Máy chơi cùng +' }).click()
  await axeCheck(page, `${label} thiết lập`)
  await page.getByRole('button', { name: 'Bắt đầu' }).click()
  await page.clock.runFor(500)
  if (shots) await page.screenshot({ path: join(shots, `${label}-board.png`) })
  await axeCheck(page, `${label} bàn cờ`)
  // vài bước rồi thử hoàn tác
  await play(page, { maxSteps: 12, label })
  const undo = page.getByRole('button', { name: 'Hoàn tác' })
  // (giữa lúc kiểm và lúc bấm có thể có cửa sổ mở ra che nút — khi đó bỏ qua bước này)
  if ((await undo.isEnabled()) && (await undo.click({ timeout: 2000 }).then(() => true, () => false))) check(true, `${label}: hoàn tác bấm được`)
  // tải lại → Tiếp tục ván
  await page.reload()
  check(leaveAsked > 0, `${label}: rời trang khi đang chơi có hỏi lại`)
  const resume = page.getByRole('button', { name: 'Tiếp tục ván' })
  check(await visible(resume), `${label}: tải lại có nút "Tiếp tục ván"`)
  if (await visible(resume)) await resume.click()
  const res = await play(page, { label, axe: true })
  check(res.done, `${label}: chơi trọn ván tới màn kết thúc (${res.answered} câu trả lời)`)
  await axeCheck(page, `${label} kết thúc`)
  if (shots) await page.screenshot({ path: join(shots, `${label}-end.png`), fullPage: true })
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  check(sw <= 0, `${label}: không cuộn ngang`)
  // sau khi kết thúc, về trang chủ không còn "Tiếp tục ván"
  await page.getByRole('button', { name: 'Về trang chủ' }).click()
  check(!(await visible(page.getByRole('button', { name: 'Tiếp tục ván' }))), `${label}: ván đã kết thúc không còn "Tiếp tục ván"`)
  // thử thách cá nhân
  await page.getByRole('button', { name: 'Chơi trên một máy' }).click()
  while (await visible(page.getByRole('button', { name: 'Bỏ người này' }))) await page.getByRole('button', { name: 'Bỏ người này' }).first().click()
  while (await page.getByRole('button', { name: 'Máy chơi cùng −' }).isEnabled()) await page.getByRole('button', { name: 'Máy chơi cùng −' }).click()
  await page.getByRole('button', { name: 'Bắt đầu' }).click()
  const solo = await play(page, { label: `${label}-solo`, pick: 'first' })
  check(solo.done, `${label}: thử thách cá nhân chơi tới kết thúc`)
  const soloBox = await page
    .getByText('Thử thách cá nhân', { exact: true })
    .first()
    .waitFor({ timeout: 5000 })
    .then(() => true)
    .catch(() => false)
  check(soloBox, `${label}: màn kết thúc có mục thử thách cá nhân / kỷ lục`)
  if (shots) await page.screenshot({ path: join(shots, `${label}-solo-end.png`), fullPage: true })
  // 2 ngựa: chọn ngựa ngay trong khu điều khiển (không che bàn cờ)
  await page.getByRole('button', { name: 'Về trang chủ' }).click()
  await page.getByRole('button', { name: 'Chơi trên một máy' }).click()
  await page.getByRole('button', { name: 'Máy chơi cùng +' }).click()
  await page.getByRole('radio', { name: '2', exact: true }).check({ force: true })
  await page.getByRole('button', { name: 'Bắt đầu' }).click()
  const two = await play(page, { label: `${label}-2ngua` })
  check(two.done && two.chose > 0, `${label}: 2 ngựa chơi tới kết thúc, chọn ngựa ${two.chose} lần`)
  check(errors.length === 0, `${label}: không lỗi console${errors.length ? ` — ${errors.slice(0, 3).join(' | ')}` : ''}`)
  check(external.length === 0, `${label}: không request ra ngoài${external.length ? ` — ${external.slice(0, 3).join(', ')}` : ''}`)
  await context.close()
}
await browser.close()
if (failures.length) {
  console.error(`\n${failures.length} kiểm tra không đạt`)
  process.exit(1)
}
console.log('\nTất cả kiểm tra đạt')
