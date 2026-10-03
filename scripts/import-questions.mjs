#!/usr/bin/env node
// Nhập bộ câu hỏi của nhóm (mục 13, 17 — bản 1.6):
//   docs/CAU-HOI-GAME.md (bảng 8 cột theo mẫu docs/CAU-HOI-GAME.mau.md) → src/data/questions.json
// - Báo rõ dòng sai (thiếu cột, độ khó không thuộc 1–3, đáp án đúng không thuộc A–D, đáp án
//   trùng, câu trùng…) và KHÔNG ghi đè questions.json khi còn lỗi.
// - Loại câu tự suy ra (mục 13.4). Câu hỏi thử (src/data/test-questions.json) chỉ lấp độ khó
//   còn dưới 2 câu chính thức (mục 13.3).
// - Cảnh báo (không chặn) khi số câu ba mức chênh nhau quá 3.
//
// Dùng: node scripts/import-questions.mjs [--check] [--in <file>] [--out <file>]
//   --check  chỉ kiểm tra, không ghi file

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findQuestionTable, parseQuestionRows } from './lib/question-table.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIN_PER_DIFFICULTY = 2
const MAX_SPREAD = 3
const DIFFICULTIES = [1, 2, 3]

/** Câu hỏi thử lấp độ khó còn dưới MIN_PER_DIFFICULTY câu chính thức */
export function selectTestFill(official, testPool) {
  const chosen = []
  const gaps = []
  for (const d of DIFFICULTIES) {
    const have = official.filter((q) => q.difficulty === d).length
    const need = Math.max(0, MIN_PER_DIFFICULTY - have)
    if (need === 0) continue
    const picked = testPool.filter((q) => q.difficulty === d).slice(0, need)
    chosen.push(...picked)
    gaps.push({ difficulty: d, official: have, test: picked.length, missing: need - picked.length })
  }
  return { chosen, gaps }
}

function loadJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'))
}

export function runImport({ inFile, outFile, check }) {
  const testPool = loadJson('src/data/test-questions.json').questions

  if (!existsSync(inFile)) return { ok: false, messages: [`Không tìm thấy ${relative(root, inFile)}`] }
  // chuẩn hóa NFC: văn bản gõ kiểu "Unicode tổ hợp" hoặc dán từ PDF vẫn kiểm đúng
  const md = readFileSync(inFile, 'utf8').normalize('NFC')
  const table = findQuestionTable(md)
  if (!table) {
    return { ok: false, messages: [`${relative(root, inFile)}: không thấy bảng câu hỏi (dòng tiêu đề phải đúng 8 cột như mẫu docs/CAU-HOI-GAME.mau.md)`] }
  }
  const { questions, errors } = parseQuestionRows(table.rows)
  for (const line of table.stray) {
    errors.push({ line, message: `dòng nằm ngoài bảng câu hỏi (bảng bị ngắt ở dòng ${table.endLine + 1} bởi dòng trống, comment hoặc bảng khác) — nối dòng này vào bảng chính` })
  }
  errors.sort((a, b) => a.line - b.line)
  const name = relative(root, inFile)
  if (errors.length > 0) {
    return {
      ok: false,
      messages: [
        `${name}: ${errors.length} lỗi — chưa ghi questions.json.`,
        ...errors.map((e) => `  dòng ${e.line}${e.id ? ` (${e.id})` : ''}: ${e.message}`),
      ],
    }
  }
  const { chosen, gaps } = selectTestFill(questions, testPool)
  const all = [...questions, ...chosen]
  const messages = [`${name}: ${questions.length} câu chính thức hợp lệ.`]
  const counts = DIFFICULTIES.map((d) => questions.filter((q) => q.difficulty === d).length)
  messages.push(
    `Số câu theo độ khó: ${DIFFICULTIES.map((d, i) => {
      const t = chosen.filter((q) => q.difficulty === d).length
      return `mức ${d}: ${counts[i]}${t ? ` + ${t} thử` : ''}`
    }).join(' · ')}`,
  )
  const types = ['single', 'truefalse', 'fillQuote'].map((t) => `${t} ${questions.filter((q) => q.type === t).length}`)
  messages.push(`Loại câu (tự suy ra): ${types.join(' · ')}`)
  if (Math.max(...counts) - Math.min(...counts) > MAX_SPREAD) {
    messages.push(`  CẢNH BÁO: số câu ba mức chênh nhau hơn ${MAX_SPREAD} — các mức sẽ xen kẽ không đều (mục 13.1).`)
  }
  for (const g of gaps.filter((x) => x.missing > 0)) messages.push(`  CẢNH BÁO: độ khó ${g.difficulty} vẫn thiếu ${g.missing} câu (kho câu hỏi thử không đủ)`)
  messages.push(chosen.length ? `Câu hỏi thử dùng: ${chosen.map((q) => q.id).join(', ')}` : 'Không dùng câu hỏi thử.')
  if (!check) {
    try {
      writeFileSync(outFile, JSON.stringify(all, null, 2) + '\n')
    } catch (e) {
      return { ok: false, messages: [...messages, `Không ghi được ${outFile}: ${e.message}`] }
    }
    messages.push(`Đã ghi ${relative(root, outFile)} (${all.length} câu).`)
  }
  return { ok: true, messages, questions: all }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const args = process.argv.slice(2)
  const opt = (flag, def) => {
    const i = args.indexOf(flag)
    if (i < 0) return def
    const v = args[i + 1]
    if (!v || v.startsWith('--')) {
      console.error(`Thiếu giá trị cho ${flag}`)
      process.exit(1)
    }
    return resolve(process.cwd(), v)
  }
  const res = runImport({
    inFile: opt('--in', join(root, 'docs/CAU-HOI-GAME.md')),
    outFile: opt('--out', join(root, 'src/data/questions.json')),
    check: args.includes('--check'),
  })
  for (const m of res.messages) (res.ok ? console.log : console.error)(m)
  process.exit(res.ok ? 0 : 1)
}
