#!/usr/bin/env node
// Chạy thử "Chơi trên một máy" trong Chromium thật (playwright-core): chơi trọn ván qua giao
// diện, ở 360 × 780 và 1366 × 768. Kiểm: không lỗi console, không request mạng ra ngoài,
// không cuộn ngang, tải lại → "Tiếp tục ván", hoàn tác; G5: ôn câu sai, Luật chơi, Kho câu hỏi,
// Cài đặt (giao diện, cỡ chữ, hiệu ứng), Menu trong ván, phím tắt (Space, 1–4, M).
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

async function noHScroll(page, name) {
  // clientWidth (không phải innerWidth): khi giả lập điện thoại, innerWidth phình theo nội dung tràn
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check(sw <= 0, `${name}: không cuộn ngang`)
}

/** Luật chơi, Kho câu hỏi, Cài đặt từ trang chủ (mục 12.1, 12.8, 12.9) */
async function infoScreens(page, label) {
  await page.getByRole('button', { name: 'Luật chơi' }).click()
  check(await visible(page.getByRole('heading', { name: 'Power-up' })), `${label}: Luật chơi có mục power-up`)
  check(await visible(page.getByRole('heading', { name: 'Thẻ bẫy' })), `${label}: Luật chơi có mục thẻ bẫy`)
  await axeCheck(page, `${label} luật chơi`)
  await noHScroll(page, `${label} luật chơi`)
  if (shots) await page.screenshot({ path: join(shots, `${label}-rules.png`), fullPage: true })
  await page.getByRole('button', { name: /Về trang chủ/ }).first().click()

  await page.getByRole('button', { name: 'Kho câu hỏi' }).click()
  const total = await page.getByText(/^Tổng số câu hỏi: \d+$/).textContent()
  const n = Number(total.match(/\d+/)[0])
  check(n > 0 && (await page.locator('[data-question]').count()) === n, `${label}: Kho câu hỏi hiện đủ ${n} câu`)
  check(!(await visible(page.getByText('Đáp án đúng', { exact: true }))), `${label}: đáp án ẩn mặc định`)
  await page.locator('[data-question]').first().getByRole('button', { name: 'Hiện đáp án' }).click()
  check(await visible(page.locator('[data-question]').first().getByText('Đáp án đúng', { exact: true })), `${label}: bấm "Hiện đáp án" thì hiện`)
  await page.locator('fieldset', { hasText: 'Độ khó' }).locator('label.seg', { hasText: /^3$/ }).click()
  const hardCount = await page.locator('[data-question]').count()
  check(hardCount > 0 && hardCount < n, `${label}: lọc theo độ khó (${hardCount}/${n})`)
  check((await page.getByText(/Trụ cột|Nguồn:|Chờ xác minh|Hiện vật liên quan/).count()) === 0, `${label}: Kho câu hỏi không còn trụ cột, nguồn, [Chờ xác minh], hiện vật`)
  await page.locator('label.seg', { hasText: 'Tất cả' }).first().click()
  const wrong = page.getByLabel(/Câu từng trả lời sai trên máy này/)
  check(await wrong.isEnabled(), `${label}: Sổ ôn tập có câu sai từ ván vừa chơi`)
  await wrong.check()
  const nWrong = await page.locator('[data-question]').count()
  await axeCheck(page, `${label} kho câu hỏi`)
  await noHScroll(page, `${label} kho câu hỏi`)
  if (shots) await page.screenshot({ path: join(shots, `${label}-bank.png`) })
  // ôn tập các câu đang lọc bằng bàn phím: 1 = đáp án đầu, Space = câu tiếp
  await page.getByRole('button', { name: /^Ôn tập \d+ câu đang lọc$/ }).click()
  await page.keyboard.press('1')
  check(await visible(page.getByRole('dialog').locator('[data-correct-answer]')), `${label}: ôn tập — phím 1 chọn đáp án, hiện đáp án đúng`)
  await axeCheck(page, `${label} ôn tập`)
  // Space (hoặc nút đang có tiêu điểm) sang câu tiếp; phần còn lại bấm nút trực tiếp
  await page.keyboard.press('Space')
  const dlg = page.getByRole('dialog')
  if (nWrong > 1) check(await visible(dlg.getByText(/^Câu 2\/\d+$/)), `${label}: ôn tập — phím Space sang câu tiếp`)
  for (let i = 0; i < nWrong * 2 + 4 && !(await visible(page.getByText(/^Bạn trả lời đúng/))); i++) {
    const nextBtn = dlg.getByRole('button', { name: /^(Câu tiếp|Xem kết quả)$/ })
    if (await visible(nextBtn)) await nextBtn.click()
    else if (await visible(dlg.locator('button[data-practice-answer]:enabled'))) await dlg.locator('button[data-practice-answer]:enabled').first().click()
  }
  check(await visible(page.getByText(/^Bạn trả lời đúng \d+\/\d+ câu\.$/)), `${label}: ôn tập tới hết, có tổng kết`)
  await dlg.getByRole('button', { name: 'Đóng' }).click()
  await page.getByRole('button', { name: /Về trang chủ/ }).first().click()

  await page.getByRole('button', { name: 'Cài đặt' }).click()
  const flip = scheme === 'dark' ? 'Sáng' : 'Tối'
  await page.locator('label.seg', { hasText: new RegExp(`^${flip}$`) }).click()
  check((await page.evaluate(() => document.documentElement.dataset.theme)) === (scheme === 'dark' ? 'light' : 'dark'), `${label}: Cài đặt đổi giao diện ${flip.toLowerCase()}`)
  await page.locator('label.seg', { hasText: /^Lớn$/ }).click()
  check((await page.evaluate(() => document.documentElement.dataset.text)) === 'large', `${label}: Cài đặt cỡ chữ lớn`)
  await axeCheck(page, `${label} cài đặt (giao diện ${flip.toLowerCase()}, chữ lớn)`)
  if (shots) await page.screenshot({ path: join(shots, `${label}-settings.png`), fullPage: true })
  await page.getByRole('button', { name: /Về trang chủ/ }).first().click()
  await axeCheck(page, `${label} trang chủ (giao diện ${flip.toLowerCase()}, chữ lớn)`)
  await noHScroll(page, `${label} trang chủ chữ lớn`)
  // tải lại vẫn nhớ cài đặt; rồi trả về mặc định
  await page.reload()
  check((await page.evaluate(() => document.documentElement.dataset.theme)) !== undefined, `${label}: tải lại vẫn nhớ cài đặt`)
  await page.getByRole('button', { name: 'Cài đặt' }).click()
  await page.locator('label.seg', { hasText: /^Theo máy$/ }).nth(1).click()
  await page.locator('label.seg', { hasText: /^Vừa$/ }).click()
  await page.getByRole('button', { name: /Về trang chủ/ }).first().click()
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
      // nút vẫn "visible" khi một cửa sổ vừa mở phủ lên → bấm hụt thì xử lý cửa sổ ở dưới
      if (await roll.click({ timeout: 2000 }).then(() => true, () => false)) continue
    }
    if (!axedR && (await visible(page.locator('[data-correct-answer]')))) {
      // bản 1.6: sau khi chốt chỉ có Đúng / Sai và đáp án đúng
      check((await page.getByRole('dialog').getByText(/Giải thích|Nguồn:|Hiện vật liên quan/).count()) === 0, `${label}: sau khi chốt không có giải thích, nguồn, hiện vật`)
      await axeCheck(page, `${label} đáp án đúng`)
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
let scheme = 'light'
for (const [w, h, sch] of [
  [360, 780, 'light'],
  [1366, 768, 'dark'],
]) {
  scheme = sch
  const label = `${w}x${h}-${scheme}`
  const context = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: sch, reducedMotion: args.includes('--motion') ? 'no-preference' : 'reduce' })
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
  await noHScroll(page, `${label} bàn cờ 4 người`)
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
  await noHScroll(page, label)
  check((await page.getByText('Theo trụ cột').count()) === 0 && (await visible(page.getByRole('region', { name: 'Thống kê' }))), `${label}: kết thúc có thống kê, không còn mục theo trụ cột`)
  const redo = page.getByRole('button', { name: 'Làm lại các câu sai' })
  if (await visible(redo)) {
    await redo.click()
    await page.locator('button[data-practice-answer]').first().click()
    check(await visible(page.getByRole('dialog').locator('[data-correct-answer]')), `${label}: làm lại câu sai — hiện đáp án đúng`)
    await page.getByRole('dialog').getByRole('button', { name: /^(Câu tiếp|Xem kết quả)$/ }).click()
    await page.keyboard.press('Escape')
  }
  // sau khi kết thúc, về trang chủ không còn "Tiếp tục ván"
  await page.getByRole('button', { name: 'Về trang chủ' }).click()
  check(!(await visible(page.getByRole('button', { name: 'Tiếp tục ván' }))), `${label}: ván đã kết thúc không còn "Tiếp tục ván"`)
  await infoScreens(page, label)
  // thử thách cá nhân
  await page.getByRole('button', { name: 'Chơi trên một máy' }).click()
  while (await visible(page.getByRole('button', { name: 'Bỏ người này' }))) await page.getByRole('button', { name: 'Bỏ người này' }).first().click()
  while (await page.getByRole('button', { name: 'Máy chơi cùng −' }).isEnabled()) await page.getByRole('button', { name: 'Máy chơi cùng −' }).click()
  await page.getByRole('button', { name: 'Bắt đầu' }).click()
  // Menu trong ván: Luật chơi + Cài đặt, không có Kho câu hỏi
  await page.getByRole('button', { name: 'Menu' }).click()
  check(await visible(page.getByRole('dialog').getByRole('heading', { name: 'Các loại ô' })), `${label}: Menu trong ván mở Luật chơi`)
  check(!(await visible(page.getByRole('button', { name: 'Kho câu hỏi' }))), `${label}: không có Kho câu hỏi trong ván`)
  await axeCheck(page, `${label} menu trong ván`)
  await page.getByRole('dialog').getByRole('button', { name: 'Đóng' }).click()
  // phím tắt: M tắt tiếng, Space tung, 1 chọn đáp án, Space tiếp tục
  await page.keyboard.press('m')
  check(await visible(page.getByRole('button', { name: 'Bật tiếng (M)' })), `${label}: phím M tắt tiếng`)
  await page.keyboard.press('m')
  let keyAnswered = false
  // xúc xắc ngẫu nhiên: có thể nhiều lượt liền không tới ô câu hỏi → thử tới 40 lần, xử lý cửa sổ chặn
  for (let i = 0; i < 40 && !keyAnswered; i++) {
    for (const name of [/^Bỏ món mới/, /^Ngựa \d/]) {
      const b = page.getByRole('button', { name }).and(page.locator(':enabled'))
      if (await visible(b)) await b.first().click({ timeout: 2000 }).catch(() => {})
    }
    if (await visible(page.getByRole('button', { name: 'Tung xúc xắc' }))) await page.keyboard.press('Space')
    await page.clock.runFor(1500)
    if ((await page.locator('button[data-answer]:enabled').count()) > 0) {
      await page.keyboard.press('1')
      keyAnswered = await visible(page.getByRole('dialog').locator('[data-correct-answer]'))
      await page.keyboard.press('Space')
    } else if (await visible(page.getByRole('button', { name: /^Tiếp tục$/ }))) await page.keyboard.press('Space')
    await page.clock.runFor(1500)
  }
  check(keyAnswered, `${label}: phím Space tung xúc xắc, phím 1 trả lời`)
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
