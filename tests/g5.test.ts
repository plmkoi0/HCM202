// G5 — hoàn thiện: cài đặt trên máy, Sổ ôn tập, phím tắt, thống kê theo trụ cột, âm thanh theo sự kiện.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addToReview, clearReview, loadReview, removeFromReview } from '../src/game/review'
import { segmentsOf } from '../src/game/useBoardAnimation'
import { shortcutOf } from '../src/game/useShortcuts'
import { DEFAULT_SETTINGS, resolveReduced, sanitizeSettings } from '../src/lib/settings'
import { answerCorrect, answerWrong, gameData, newGame, rollFace } from './helpers'
import type { GameState } from '../src/engine/types'

class MemoryStorage {
  m = new Map<string, string>()
  getItem(k: string) {
    return this.m.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.m.set(k, v)
  }
  removeItem(k: string) {
    this.m.delete(k)
  }
}

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

describe('Sổ ôn tập', () => {
  beforeEach(() => {
    ;(globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage()
  })
  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage
  })
  it('thêm mới lên đầu, không trùng; bỏ câu đã ôn đúng; bỏ id không còn trong kho', () => {
    addToReview(['Q-01', 'Q-02'])
    addToReview(['Q-03', 'Q-01'])
    expect(loadReview()).toEqual(['Q-03', 'Q-01', 'Q-02'])
    expect(removeFromReview('Q-01')).toEqual(['Q-03', 'Q-02'])
    expect(loadReview((id) => id !== 'Q-03')).toEqual(['Q-02'])
    clearReview()
    expect(loadReview()).toEqual([])
  })
  it('giới hạn 300 câu; dữ liệu hỏng thì coi như rỗng', () => {
    addToReview(Array.from({ length: 350 }, (_, i) => `Q-${i}`))
    expect(loadReview()).toHaveLength(300)
    ;(globalThis as unknown as { localStorage: MemoryStorage }).localStorage.setItem('cdtt.review.v1', '{"a":1}')
    expect(loadReview()).toEqual([])
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

describe('Thống kê theo trụ cột (màn kết thúc)', () => {
  it('đếm đúng / đã trả lời theo trụ cột của câu', () => {
    const s0 = newGame()
    const q1 = toQuestion(s0)
    const pillar = gameData.questionById.get(q1.turn.question!.id)!.pillar
    const a = answerCorrect(q1)
    expect(a.players[0].stats.byPillar).toEqual({ [pillar]: [1, 1] })
    const b = answerWrong(q1)
    expect(b.players[0].stats.byPillar).toEqual({ [pillar]: [0, 1] })
    expect(b.players[0].stats.wrongIds).toEqual([q1.turn.question!.id])
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
