// Kiểm thử dữ liệu (mục 17 — "Dữ liệu").
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findLetterReference } from '../scripts/lib/question-table.mjs'
import artifacts from '../src/data/artifacts.json'
import board from '../src/data/board.json'
import mindmap from '../src/data/mindmap.json'
import pillarsJson from '../src/data/pillars.json'
import powerups from '../src/data/powerups.json'
import questionsJson from '../src/data/questions.json'
import tokens from '../src/data/tokens.json'
import traps from '../src/data/traps.json'
import rules from '../src/data/rules.json'
import { geometry, ringCellInfo } from '../src/engine/board'
import type { Question } from '../src/engine/types'
import { gameData } from './helpers'

const root = join(__dirname, '..')
const questions = questionsJson as Question[]
const pillarIds = mindmap.pillars.map((p) => p.id)

const count = (layout: string, kind: string) => board.layouts[layout as 'ngan'].branches.flat().filter((k) => k === kind).length

describe('trụ cột', () => {
  it('pillars.json khớp mindmap.json về id, thứ tự và tên', () => {
    expect(pillarsJson.pillars.map((p) => p.id)).toEqual(pillarIds)
    for (const p of pillarsJson.pillars) {
      expect(p.name).toBe(mindmap.pillars.find((m) => m.id === p.id)!.name)
      expect(p.color).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})

describe('câu hỏi', () => {
  it('id không trùng', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
  })

  it('2–4 đáp án, không trùng nhau; correct hợp lệ', () => {
    for (const q of questions) {
      expect(q.answers.length, q.id).toBeGreaterThanOrEqual(2)
      expect(q.answers.length, q.id).toBeLessThanOrEqual(4)
      expect(new Set(q.answers.map((a) => a.trim().toLowerCase())).size, q.id).toBe(q.answers.length)
      expect(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.answers.length, q.id).toBe(true)
    }
  })

  it('pillar có trong mindmap.json; artifact (nếu có) tồn tại; source.ref không rỗng', () => {
    const artifactIds = artifacts.map((a) => a.id)
    for (const q of questions) {
      expect(pillarIds, q.id).toContain(q.pillar)
      expect(q.artifact === undefined || artifactIds.includes(q.artifact), `${q.id}: hiện vật ${q.artifact}`).toBe(true)
      expect(q.source.ref.trim().length, q.id).toBeGreaterThan(0)
      expect([1, 2, 3], q.id).toContain(q.difficulty)
      expect(['single', 'truefalse', 'fillQuote', 'situation'], q.id).toContain(q.type)
    }
  })

  it('câu truefalse chỉ có "Đúng" / "Sai"', () => {
    for (const q of questions.filter((x) => x.type === 'truefalse')) expect(q.answers, q.id).toEqual(['Đúng', 'Sai'])
  })

  it('câu fillQuote có đúng một chỗ trống ___', () => {
    for (const q of questions.filter((x) => x.type === 'fillQuote')) expect(q.question.match(/_{2,}/g) ?? [], q.id).toEqual(['___'])
  })

  it('giải thích không nhắc chữ cái phương án (mục 13.4)', () => {
    for (const q of questions) expect(findLetterReference(q.explanation), q.id).toBeNull()
  })

  it('mọi câu có id TEST- đều có "test": true và ngược lại; câu hỏi thử đúng quy định 13.3', () => {
    for (const q of questions) expect(!!q.test, q.id).toBe(q.id.startsWith('TEST-'))
    for (const q of questions.filter((x) => x.test)) {
      expect(q.source.ref, q.id).toBe('Câu hỏi thử')
      expect(q.verified, q.id).toBe(false)
    }
  })

  it('câu hỏi thử chỉ ở tổ hợp còn dưới 2 câu chính thức; mọi tổ hợp đủ ≥ 2 câu và đủ 4 loại câu', () => {
    const official = questions.filter((q) => !q.test)
    for (const p of pillarIds) {
      for (const d of [1, 2, 3]) {
        const o = official.filter((q) => q.pillar === p && q.difficulty === d).length
        const t = questions.filter((q) => q.test && q.pillar === p && q.difficulty === d).length
        expect(o + t, `${p} độ khó ${d}`).toBeGreaterThanOrEqual(2)
        // đủ 2 câu chính thức thì không có câu hỏi thử; thiếu thì câu hỏi thử chỉ lấp tới 2
        expect(t, `${p} độ khó ${d}`).toBe(Math.max(0, 2 - o))
      }
    }
    expect(new Set(questions.map((q) => q.type))).toEqual(new Set(['single', 'truefalse', 'fillQuote', 'situation']))
  })

  it('có câu và đáp án rất dài để thử bố cục điện thoại (mục 13.3)', () => {
    expect(questions.some((q) => q.question.length > 200)).toBe(true)
    expect(questions.some((q) => q.answers.some((a) => a.length > 90))).toBe(true)
  })
})

describe('bàn cờ', () => {
  it('mỗi màu có đường đi liền mạch tới Đích ở cả hai bố cục (22 / 29 bước)', () => {
    expect(geometry(gameData, 'ngan').finishStep).toBe(22)
    expect(geometry(gameData, 'dai').finishStep).toBe(29)
  })

  it('số ô từng loại đúng cấu hình (mục 4)', () => {
    expect(['gate', 'powerup', 'trap', 'question'].map((k) => count('ngan', k))).toEqual([6, 2, 2, 8])
    expect(['gate', 'powerup', 'trap', 'question'].map((k) => count('dai', k))).toEqual([6, 3, 3, 12])
    expect(board.layouts.ngan.homeDifficulties).toEqual([2, 2, 3, 3])
    expect(board.layouts.dai.homeDifficulties).toEqual([2, 2, 3, 3, 3])
  })

  it('ô câu hỏi vòng chung theo trụ cột: Ngắn dân chủ 3, pháp quyền 3, trong sạch 2; Dài 5 / 4 / 3', () => {
    const all = new Set([0, 1, 2, 3, 4, 5])
    for (const [layout, expected] of [
      ['ngan', [3, 3, 2]],
      ['dai', [5, 4, 3]],
    ] as const) {
      const geo = geometry(gameData, layout)
      const byPillar = pillarIds.map(
        (p) => Array.from({ length: geo.ringLength }, (_, i) => ringCellInfo(gameData, geo, all, i)).filter((c) => c.kind === 'question' && c.pillar === p).length,
      )
      expect(byPillar, layout).toEqual(expected)
    }
  })

  it('mỗi trụ cột có câu ở mọi độ khó', () => {
    for (const p of pillarIds) for (const d of [1, 2, 3]) expect(questions.some((q) => q.pillar === p && q.difficulty === d), `${p}/${d}`).toBe(true)
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

  it('6 màu ngựa, ký hiệu khác nhau, không trùng màu trụ cột (D6)', () => {
    expect(tokens.colors.length).toBe(6)
    expect(new Set(tokens.colors.map((c) => c.symbol)).size).toBe(6)
    const pillarColors = pillarsJson.pillars.map((p) => p.color.toLowerCase())
    for (const c of tokens.colors) expect(pillarColors).not.toContain(c.color.toLowerCase())
  })
})

describe('nguồn gốc dữ liệu', () => {
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
