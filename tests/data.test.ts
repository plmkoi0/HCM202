// Kiểm thử dữ liệu (mục 17 — "Dữ liệu").
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inferType, questionKey } from '../scripts/lib/question-table.mjs'
import board from '../src/data/board.json'
import powerups from '../src/data/powerups.json'
import questionsJson from '../src/data/questions.json'
import tokens from '../src/data/tokens.json'
import traps from '../src/data/traps.json'
import rules from '../src/data/rules.json'
import { geometry } from '../src/engine/board'
import type { Question } from '../src/engine/types'
import { gameData } from './helpers'

const root = join(__dirname, '..')
const questions = questionsJson as Question[]

const count = (layout: string, kind: string) => board.layouts[layout as 'ngan'].branches.flat().filter((k) => k === kind).length

describe('câu hỏi (bản 1.6)', () => {
  it('id không trùng; không có hai câu trùng lời câu hỏi', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
    expect(new Set(questions.map((q) => questionKey(q.question))).size).toBe(questions.length)
  })

  it('2–4 đáp án, không trùng nhau; correct hợp lệ; độ khó 1–3', () => {
    for (const q of questions) {
      expect(q.answers.length, q.id).toBeGreaterThanOrEqual(2)
      expect(q.answers.length, q.id).toBeLessThanOrEqual(4)
      expect(new Set(q.answers.map((a) => a.trim().toLowerCase())).size, q.id).toBe(q.answers.length)
      expect(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.answers.length, q.id).toBe(true)
      expect([1, 2, 3], q.id).toContain(q.difficulty)
    }
  })

  it('chỉ có các trường id, difficulty, type, question, answers, correct (và test) — không còn pillar, explanation, source, verified, artifact', () => {
    for (const q of questions) {
      expect(Object.keys(q).filter((k) => k !== 'test'), q.id).toEqual(['id', 'difficulty', 'type', 'question', 'answers', 'correct'])
    }
  })

  it('loại câu suy ra đúng quy tắc mục 13.4; câu có ___ có đúng một chỗ trống', () => {
    for (const q of questions) expect(q.type, q.id).toBe(inferType(q.question, q.answers))
    for (const q of questions.filter((x) => x.type === 'fillQuote')) expect(q.question.match(/_{2,}/g) ?? [], q.id).toEqual(['___'])
    for (const q of questions.filter((x) => x.type === 'truefalse')) expect(q.answers, q.id).toEqual(['Đúng', 'Sai'])
  })

  it('mọi câu có id TEST- đều có "test": true và ngược lại', () => {
    for (const q of questions) expect(!!q.test, q.id).toBe(q.id.startsWith('TEST-'))
  })

  it('mỗi độ khó có ≥ 2 câu chính thức; câu hỏi thử chỉ ở độ khó còn thiếu (hiện tại: không có)', () => {
    const official = questions.filter((q) => !q.test)
    for (const d of [1, 2, 3]) {
      const o = official.filter((q) => q.difficulty === d).length
      const t = questions.filter((q) => q.test && q.difficulty === d).length
      expect(o, `độ khó ${d}`).toBeGreaterThanOrEqual(2)
      expect(t, `độ khó ${d}`).toBe(Math.max(0, 2 - o))
    }
  })

  it('bộ 55 câu: ba mức 18 / 19 / 18, chênh nhau không quá 3', () => {
    const c = [1, 2, 3].map((d) => questions.filter((q) => q.difficulty === d).length)
    expect(questions.length).toBe(55)
    expect(c).toEqual([18, 19, 18])
    expect(Math.max(...c) - Math.min(...c)).toBeLessThanOrEqual(3)
  })
})

describe('bàn cờ', () => {
  it('mỗi màu có đường đi liền mạch tới Đích ở cả hai bố cục (22 / 29 bước)', () => {
    expect(geometry(gameData, 'ngan').finishStep).toBe(22)
    expect(geometry(gameData, 'dai').finishStep).toBe(29)
  })

  it('số ô từng loại đúng cấu hình (mục 4); ô không gắn trụ cột hay độ khó', () => {
    expect(['gate', 'powerup', 'trap', 'question'].map((k) => count('ngan', k))).toEqual([6, 2, 2, 8])
    expect(['gate', 'powerup', 'trap', 'question'].map((k) => count('dai', k))).toEqual([6, 3, 3, 12])
    expect(board.layouts.ngan.homeLength).toBe(4)
    expect(board.layouts.dai.homeLength).toBe(5)
    for (const l of Object.values(board.layouts)) expect(Object.keys(l).sort()).toEqual(['branches', 'homeLength', 'label', 'note'])
  })
})

describe('power-up, bẫy, luật, màu', () => {
  it('traps.json chỉ có hai loại thẻ, tổng tỉ lệ 100%, lùi 1–3 ô, nhãn trung tính', () => {
    expect(traps.cards.map((c) => c.kind).sort()).toEqual(['back', 'loseTurn'])
    expect(traps.cards.reduce((s, c) => s + c.weight, 0)).toBe(100)
    const back = traps.cards.find((c) => c.kind === 'back')!
    expect([back.min, back.max]).toEqual([1, 3])
    expect(traps.cards.map((c) => c.label)).toEqual(['Bẫy — mất lượt', 'Bẫy — lùi {n} ô'])
  })

  it('đủ 6 power-up, túi tối đa 2 món', () => {
    expect(powerups.items.map((p) => p.id).sort()).toEqual(['advance3', 'double', 'extraRoll', 'fiftyFifty', 'shield', 'swap'])
    expect(powerups.bagSize).toBe(2)
  })

  it('luật mặc định đã chốt: 10 phút, mốc 5/7/10/15/không giới hạn, Đoán cùng tắt, 1 ngựa, tối đa 5 người', () => {
    expect(rules.defaults.timeLimitMin).toBe(10)
    expect(rules.timeLimitOptions).toEqual([5, 7, 10, 15, null])
    expect(rules.defaults.guessAlong).toBe(false)
    expect(rules.defaults.horsesPerPlayer).toBe(1)
    expect(rules.maxPlayers).toBe(5)
    expect(board.layouts[board.defaultLayout as 'ngan'].branches.length).toBe(6)
  })

  it('6 màu ngựa, ký hiệu khác nhau', () => {
    expect(tokens.colors.length).toBe(6)
    expect(new Set(tokens.colors.map((c) => c.symbol)).size).toBe(6)
  })

  it('hiện đáp án 3 giây sau khi chốt (bản 1.6, mục 8)', () => {
    expect(rules.timers.revealMs).toBe(3000)
  })
})

describe('nguồn gốc dữ liệu', () => {
  it('bản 1.6 đã gỡ artifacts.json, mindmap.json, pillars.json', () => {
    for (const f of ['artifacts', 'mindmap', 'pillars']) expect(existsSync(join(root, `src/data/${f}.json`)), f).toBe(false)
  })

  // Chỉ kiểm bản sao nguồn tham chiếu trong docs/nguon/ (không được sửa); dữ liệu trong
  // src/data/ thuộc về game và được phép sửa sau khi chép.
  it('mã băm trong NGUON.md khớp bản sao nguồn tham chiếu ở docs/nguon/', () => {
    const nguon = readFileSync(join(root, 'src/data/NGUON.md'), 'utf8')
    const lines = [...nguon.matchAll(/^([0-9a-f]{64}) {2}(\S+)$/gm)].filter(([, , f]) => f.startsWith('docs/nguon/'))
    expect(lines.length).toBe(2)
    for (const [, hash, file] of lines) {
      const actual = createHash('sha256').update(readFileSync(join(root, file))).digest('hex')
      expect(actual, file).toBe(hash)
    }
  })
})
