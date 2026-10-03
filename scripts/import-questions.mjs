#!/usr/bin/env node
// Nhập bộ câu hỏi của nhóm (mục 13.1, 17):
//   docs/CAU-HOI-GAME.md (bảng theo mẫu docs/CAU-HOI-GAME.mau.md) → src/data/questions.json
// - Báo rõ dòng sai (thiếu cột, đáp án đúng không thuộc A–D, trụ cột không hợp lệ,
//   thiếu nguồn, giải thích nhắc chữ cái phương án…) và KHÔNG ghi đè questions.json khi còn lỗi.
// - Câu hỏi thử (src/data/test-questions.json) chỉ lấp những tổ hợp trụ cột × độ khó
//   còn dưới 2 câu chính thức, ưu tiên loại câu còn thiếu (mục 13.3).
//
// Dùng: node scripts/import-questions.mjs [--check] [--in <file>] [--out <file>]
//   --check  chỉ kiểm tra, không ghi file

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findQuestionTable, parseQuestionRows, TYPES } from './lib/question-table.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIN_PER_COMBO = 2

export function selectTestFill(official, testPool, pillarIds) {
  const count = new Map()
  for (const q of official) count.set(`${q.pillar}|${q.difficulty}`, (count.get(`${q.pillar}|${q.difficulty}`) ?? 0) + 1)
  const covered = new Set(official.map((q) => q.type))
  const chosen = []
  const gaps = []
  for (const pillar of pillarIds) {
    for (const d of [1, 2, 3]) {
      const have = count.get(`${pillar}|${d}`) ?? 0
      const need = Math.max(0, MIN_PER_COMBO - have)
      if (need === 0) continue
      const pool = testPool.filter((q) => q.pillar === pillar && q.difficulty === d)
      const picked = []
      for (let k = 0; k < need; k++) {
        const left = pool.filter((q) => !picked.includes(q))
        if (left.length === 0) break
        const q = left.find((x) => !covered.has(x.type)) ?? left[0]
        picked.push(q)
        covered.add(q.type)
      }
      chosen.push(...picked)
      gaps.push({ pillar, difficulty: d, official: have, test: picked.length, missing: need - picked.length })
    }
  }
  return { chosen, gaps, missingTypes: TYPES.filter((t) => !covered.has(t)) }
}

function loadJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'))
}

export function runImport({ inFile, outFile, check }) {
  const mindmap = loadJson('src/data/mindmap.json')
  const artifacts = loadJson('src/data/artifacts.json')
  const testPool = loadJson('src/data/test-questions.json').questions
  const pillarIds = mindmap.pillars.map((p) => p.id)
  const artifactIds = artifacts.map((a) => a.id)

  if (!existsSync(inFile)) return { ok: false, messages: [`Không tìm thấy ${relative(root, inFile)}`] }
  // chuẩn hóa NFC: văn bản gõ kiểu "Unicode tổ hợp" hoặc dán từ PDF vẫn kiểm đúng
  const md = readFileSync(inFile, 'utf8').normalize('NFC')
  const table = findQuestionTable(md)
  if (!table) {
    return { ok: false, messages: [`${relative(root, inFile)}: không thấy bảng câu hỏi (dòng tiêu đề phải đúng 14 cột như mẫu docs/CAU-HOI-GAME.mau.md)`] }
  }
  const { questions, errors } = parseQuestionRows(table.rows, { pillarIds, artifactIds })
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
  const { chosen, gaps, missingTypes } = selectTestFill(questions, testPool, pillarIds)
  const all = [...questions, ...chosen]
  const messages = [`${name}: ${questions.length} câu chính thức hợp lệ.`]
  const table2 = pillarIds.map((p) => {
    const cells = [1, 2, 3].map((d) => {
      const o = questions.filter((q) => q.pillar === p && q.difficulty === d).length
      const t = chosen.filter((q) => q.pillar === p && q.difficulty === d).length
      return `độ khó ${d}: ${o}${t ? ` + ${t} thử` : ''}`
    })
    return `  ${p}: ${cells.join(' · ')}`
  })
  messages.push('Số câu theo trụ cột × độ khó (chính thức + câu hỏi thử):', ...table2)
  for (const g of gaps.filter((x) => x.missing > 0)) messages.push(`  CẢNH BÁO: ${g.pillar} độ khó ${g.difficulty} vẫn thiếu ${g.missing} câu (kho câu hỏi thử không đủ)`)
  if (missingTypes.length) messages.push(`  CẢNH BÁO: bộ câu hỏi chưa có loại ${missingTypes.join(', ')}`)
  const unverified = questions.filter((q) => !q.verified).length
  if (unverified) messages.push(`  ${unverified} câu verified: false — game hiện nhãn [Chờ xác minh].`)
  messages.push(chosen.length ? `Câu hỏi thử dùng: ${chosen.map((q) => q.id).join(', ')}` : 'Không còn câu hỏi thử.')
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
