import { describe, expect, it } from 'vitest'
import artifactsJson from '../data/artifacts.json'
import quizJson from '../data/quiz.json'
import type { QuizData } from '../types'
import { levelFor, score } from './scoring'

const quiz = quizJson as QuizData
const { questions, levels } = quiz
const total = questions.length

describe('score', () => {
  it('đúng cả 10 câu → 10, sai cả 10 câu → 0', () => {
    expect(score(questions, questions.map((q) => q.correctIndex))).toBe(10)
    expect(score(questions, questions.map((q) => (q.correctIndex + 1) % 4))).toBe(0)
  })

  it('đếm đúng số câu trả lời đúng; câu chưa trả lời không tính', () => {
    const answers = questions.map((q, i) => (i % 2 === 0 ? q.correctIndex : (q.correctIndex + 1) % 4))
    expect(score(questions, answers)).toBe(5)
    expect(score(questions, [])).toBe(0)
  })
})

describe('levelFor', () => {
  it.each([
    [0, 'ghe-bao-tang'],
    [5, 'ghe-bao-tang'],
    [6, 'dang-hoc'],
    [8, 'dang-hoc'],
    [9, 'am-hieu'],
    [10, 'am-hieu'],
  ])('%i điểm → %s', (points, id) => {
    expect(levelFor(points, levels).id).toBe(id)
  })

  it('levels phủ kín 0–10, không chồng lấn', () => {
    for (let p = 0; p <= total; p++) {
      expect(levels.filter((l) => p >= l.min && p <= l.max)).toHaveLength(1)
    }
    for (const l of levels) {
      expect(Number.isInteger(l.min) && Number.isInteger(l.max) && l.min <= l.max).toBe(true)
      expect(l.min).toBeGreaterThanOrEqual(0)
      expect(l.max).toBeLessThanOrEqual(total)
    }
  })

})

describe('dữ liệu quiz', () => {
  it('có 10 câu, id không trùng, trụ cột hợp lệ', () => {
    expect(questions).toHaveLength(10)
    expect(new Set(questions.map((q) => q.id)).size).toBe(10)
    for (const q of questions) expect(['dan-chu', 'phap-quyen', 'trong-sach']).toContain(q.pillar)
  })

  it('mỗi câu có đúng 4 lựa chọn và correctIndex hợp lệ', () => {
    for (const q of questions) {
      expect(q.options).toHaveLength(4)
      expect(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4).toBe(true)
    }
  })

  it('mọi relatedArtifacts tồn tại trong artifacts.json', () => {
    const ids = new Set((artifactsJson as { id: string }[]).map((a) => a.id))
    for (const q of questions) {
      expect(q.relatedArtifacts.length).toBeGreaterThan(0)
      for (const id of q.relatedArtifacts) expect(ids.has(id), `${q.id} → ${id}`).toBe(true)
    }
  })

  it('id mức không trùng, dùng được trong tên file thẻ PNG', () => {
    expect(new Set(levels.map((l) => l.id)).size).toBe(levels.length)
    for (const l of levels) expect(l.id).toMatch(/^[a-z0-9-]+$/)
  })
})
