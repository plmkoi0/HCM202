import { describe, expect, it } from 'vitest'
import quiz from '../data/quiz.json'
import type { CitizenTypeId } from '../types'
import { isTypeId, score } from './scoring'

const tie = quiz.tieBreak as CitizenTypeId[]
const seq = (s: string) => s.split('') as CitizenTypeId[]

describe('score', () => {
  it('dùng thứ tự hòa điểm C → D → B → A từ quiz.json', () => {
    expect(tie).toEqual(['C', 'D', 'B', 'A'])
  })

  it('thắng rõ ràng', () => {
    const r = score(seq('AAAAABCD'), tie)
    expect(r.winner).toBe('A')
    expect(r.counts).toEqual({ A: 5, B: 1, C: 1, D: 1 })
  })

  it('hòa 2 kiểu: theo thứ tự ưu tiên', () => {
    expect(score(seq('AAAABBBB'), tie).winner).toBe('B')
    expect(score(seq('AAAADDDD'), tie).winner).toBe('D')
    expect(score(seq('DDDCCCAB'), tie).winner).toBe('C')
  })

  it('hòa 4 kiểu: chọn C', () => {
    expect(score(seq('AABBCCDD'), tie).winner).toBe('C')
  })

  it('tính đúng tỉ lệ phần trăm', () => {
    expect(score(seq('AAAACCDD'), tie).percents).toEqual({ A: 50, B: 0, C: 25, D: 25 })
    expect(score(seq('AABBCCDD'), tie).percents).toEqual({ A: 25, B: 25, C: 25, D: 25 })
    // 12,5% và 87,5%: phần dư bằng nhau, ưu tiên theo tieBreak (B trước A)
    expect(score(seq('ABBBBBBB'), tie).percents).toEqual({ A: 12, B: 88, C: 0, D: 0 })
    // 37,5% · 37,5% · 25%: phần dư bằng nhau, C được ưu tiên hơn A
    expect(score(seq('AAACCCDD'), tie).percents).toEqual({ A: 37, B: 0, C: 38, D: 25 })
  })

  it('tổng phần trăm luôn bằng 100 với mọi tổ hợp 8 câu', () => {
    let combos = 0
    for (let a = 0; a <= 8; a++)
      for (let b = 0; a + b <= 8; b++)
        for (let c = 0; a + b + c <= 8; c++) {
          const d = 8 - a - b - c
          const answers = seq('A'.repeat(a) + 'B'.repeat(b) + 'C'.repeat(c) + 'D'.repeat(d))
          const { percents } = score(answers, tie)
          expect(percents.A + percents.B + percents.C + percents.D).toBe(100)
          combos++
        }
    expect(combos).toBe(165)
  })

  it('không có câu trả lời thì tỉ lệ bằng 0', () => {
    expect(score([], tie).percents).toEqual({ A: 0, B: 0, C: 0, D: 0 })
  })
})

describe('isTypeId', () => {
  it('chỉ nhận A, B, C, D', () => {
    expect(['A', 'B', 'C', 'D'].every(isTypeId)).toBe(true)
    expect(['a', 'E', '', 'AB', null].some(isTypeId)).toBe(false)
  })
})
