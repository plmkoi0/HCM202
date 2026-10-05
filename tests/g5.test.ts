// G5 — hoàn thiện: cài đặt trên máy, phím tắt, thống kê, âm thanh theo sự kiện.
import { describe, expect, it } from 'vitest'
import { segmentsOf } from '../src/game/useBoardAnimation'
import { shortcutOf } from '../src/game/useShortcuts'
import { DEFAULT_SETTINGS, resolveReduced, sanitizeSettings } from '../src/lib/settings'
import { answerCorrect, answerWrong, newGame, rollFace } from './helpers'
import type { GameState } from '../src/engine/types'

describe('Cài đặt trên máy', () => {
  it('đọc lại dữ liệu cũ / hỏng thì giữ phần hợp lệ, phần sai về mặc định', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(sanitizeSettings('x')).toEqual(DEFAULT_SETTINGS)
    expect(sanitizeSettings({ sound: false, motion: 'reduce', theme: 'purple', textSize: 'large' })).toEqual({ sound: false, motion: 'reduce', theme: 'system', textSize: 'large' })
    expect(sanitizeSettings({ sound: 'yes' }).sound).toBe(true)
  })
  it('giảm hiệu ứng: "Theo máy" theo prefers-reduced-motion, còn lại theo lựa chọn', () => {
    expect(resolveReduced('system', true)).toBe(true)
    expect(resolveReduced('system', false)).toBe(false)
    expect(resolveReduced('reduce', false)).toBe(true)
    expect(resolveReduced('full', true)).toBe(false)
  })
})

const key = (k: string, extra: Partial<KeyboardEvent> = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, repeat: false, ...extra })
const el = (tagName: string, attrs: Record<string, string> = {}) => ({ tagName, isContentEditable: false, getAttribute: (n: string) => attrs[n] ?? null }) as unknown as EventTarget

describe('Phím tắt (mục 16)', () => {
  const body = el('BODY')
  it('Space = tung / tiếp tục; 1–4, A–D = đáp án; Q/W = power-up; M, F', () => {
    expect(shortcutOf(key(' '), body)).toEqual({ kind: 'primary' })
    expect(shortcutOf(key('3'), body)).toEqual({ kind: 'answer', pos: 2 })
    expect(shortcutOf(key('D'), body)).toEqual({ kind: 'answer', pos: 3 })
    expect(shortcutOf(key('q'), body)).toEqual({ kind: 'power', slot: 0 })
    expect(shortcutOf(key('W'), body)).toEqual({ kind: 'power', slot: 1 })
    expect(shortcutOf(key('m'), body)).toEqual({ kind: 'mute' })
    expect(shortcutOf(key('f'), body)).toEqual({ kind: 'fullscreen' })
    expect(shortcutOf(key('5'), body)).toBeNull()
  })
  it('không bắt phím khi đang gõ chữ, có Ctrl/⌘/Alt, giữ phím, hoặc Space trên nút', () => {
    expect(shortcutOf(key('a'), el('INPUT'))).toBeNull()
    expect(shortcutOf(key('1'), el('TEXTAREA'))).toBeNull()
    expect(shortcutOf(key('f', { ctrlKey: true }), body)).toBeNull()
    expect(shortcutOf(key('m', { metaKey: true }), body)).toBeNull()
    expect(shortcutOf(key('1', { repeat: true }), body)).toBeNull()
    expect(shortcutOf(key(' '), el('BUTTON'))).toBeNull()
    expect(shortcutOf(key(' '), el('g', { role: 'button' }))).toBeNull()
    // phím chữ / số vẫn dùng được khi tiêu điểm ở trên nút
    expect(shortcutOf(key('2'), el('BUTTON'))).toEqual({ kind: 'answer', pos: 1 })
  })
})

/** tung tới khi gặp ô câu hỏi */
function toQuestion(s: GameState): GameState {
  for (let face = 1; face <= 6; face++) {
    const r = rollFace(s, face)
    if (r.phase === 'question') return r
  }
  throw new Error('không gặp ô câu hỏi')
}

describe('Thống kê và ôn câu sai (bản 1.6: không còn thống kê theo trụ cột)', () => {
  it('đếm câu đúng / sai, ghi câu sai để ôn; không có byPillar', () => {
    const q1 = toQuestion(newGame())
    const a = answerCorrect(q1)
    expect(a.players[0].stats).toMatchObject({ correct: 1, wrong: 0, wrongIds: [] })
    const b = answerWrong(q1)
    expect(b.players[0].stats).toMatchObject({ correct: 0, wrong: 1, wrongIds: [q1.turn.question!.id] })
    expect('byPillar' in b.players[0].stats).toBe(false)
  })
})

describe('Âm thanh theo sự kiện', () => {
  it('đúng / sai / power-up / bẫy / về đích phát đúng lúc diễn tới sự kiện', () => {
    const seg = segmentsOf([
      { seq: 1, type: 'rolled', playerId: 'p1', data: { face: 3, value: 3 } },
      { seq: 2, type: 'answeredCorrect', playerId: 'p1', data: { from: 0, to: 3, horse: 0 } },
      { seq: 3, type: 'finished', playerId: 'p1' },
      { seq: 4, type: 'trapDrawn', playerId: 'p1' },
      { seq: 5, type: 'answeredWrong', playerId: 'p1' },
    ])
    expect(seg.map((x) => (x.kind === 'cue' ? x.sound : x.kind))).toEqual(['dice', 'correct', 'move', 'finish', 'trap', 'wrong'])
  })
})
