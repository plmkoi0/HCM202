// "Chơi trên một máy": lưu / tiếp tục ván, hoàn tác, thử thách cá nhân + kỷ lục (mục 9, 12.7)
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { currentPlayer, pendingAutoAction } from '../src/engine/reducer'
import {
  applyLocal,
  canUndo,
  clearSave,
  isSoloChallenge,
  isUsableSave,
  loadSave,
  newLocalGame,
  recordKey,
  resumeLocal,
  SAVE_KEY,
  settleRecord,
  storeSave,
  undoLocal,
  type LocalSave,
} from '../src/game/local'
import { load, save } from '../src/lib/storage'
import { cleanNickname, clock, fill } from '../src/lib/text'
import { gameData } from './helpers'

const T = 5_000_000
const setup = (humans: number, bots: number) => ({
  players: [
    ...Array.from({ length: humans }, (_, i) => ({ name: `Người ${i + 1}`, color: i, isBot: false })),
    ...Array.from({ length: bots }, (_, i) => ({ name: `Máy ${i + 1}`, color: humans + i, isBot: true })),
  ],
  config: { timeLimitMin: 10 },
})

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

/** Chạy hành động tự động (máy, quá hạn) cho tới khi tới lượt người */
function autoUntilHuman(s: LocalSave): LocalSave {
  let cur = s
  for (let i = 0; i < 500 && cur.present.phase !== 'ended'; i++) {
    const p = currentPlayer(cur.present)
    if (!p.isBot && cur.present.phase === 'roll') return cur
    const a = pendingAutoAction(cur.present, cur.present.deadline!)!
    const r = applyLocal(gameData, cur, a, false, a.now)
    if (!r.ok) throw new Error(r.error)
    cur = r.save
  }
  return cur
}

describe('Chơi trên một máy', () => {
  beforeEach(() => {
    ;(globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage()
  })
  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage
  })

  it('tạo ván: Đoán cùng luôn tắt (cùng một thiết bị), người chơi theo thiết lập', () => {
    const s = newLocalGame(gameData, { ...setup(2, 1), config: { guessAlong: true } }, T, 9)
    expect(s.present.config.guessAlong).toBe(false)
    expect(s.present.players.map((p) => [p.name, p.isBot])).toEqual([
      ['Người 1', false],
      ['Người 2', false],
      ['Máy 1', true],
    ])
  })

  it('hoàn tác chỉ cho thao tác chọn (bật ×2); tung xúc xắc xóa lịch sử; bước tự động không tạo điểm hoàn tác', () => {
    const s0 = autoUntilHuman(newLocalGame(gameData, setup(1, 2), T, 4))
    expect(canUndo(s0)).toBe(false)
    const actor = currentPlayer(s0.present).id
    // cho người đến lượt một Xúc xắc ×2 trong túi
    const present = structuredClone(s0.present)
    present.players.find((p) => p.id === actor)!.bag = ['double']
    const s: LocalSave = { ...s0, present }
    const before = s.present
    const r = applyLocal(gameData, s, { type: 'USE_POWERUP', actor, powerup: 'double', now: T }, true, T)
    expect(r.ok).toBe(true)
    const armed = (r as { save: LocalSave }).save
    expect(armed.present.turn.doubleArmed).toBe(true)
    expect(armed.past.length).toBe(1)
    const u = undoLocal(armed, T + 99_000)
    expect(u.present.turn.doubleArmed).toBe(false)
    expect(u.present.players).toEqual(before.players)
    // hạn được đặt lại từ lúc hoàn tác, không kích hoạt tự tung ngay
    expect(u.present.deadline).toBe(T + 99_000 + gameData.rules.timers.rollMs)
    expect(canUndo(u)).toBe(false)
    // tung xúc xắc (lộ kết quả ngẫu nhiên) → không hoàn tác được nữa, kể cả bước bật ×2 trước đó
    const rolled = applyLocal(gameData, armed, { type: 'ROLL', actor, now: T + 1 }, true, T + 1)
    expect(rolled.ok && rolled.save.past.length).toBe(0)
    // tự tung khi quá hạn (không phải thao tác của người) → không có điểm hoàn tác
    const auto = pendingAutoAction(before, before.deadline!)!
    expect(auto.type).toBe('AUTO_ROLL')
    const x = applyLocal(gameData, s, auto, false, auto.now)
    expect(x.ok && x.save.past.length).toBe(0)
  })

  it('hiện câu hỏi, dùng 50:50 / Đổi câu thì không hoàn tác được (không dùng lại 50:50, không kéo dài giờ)', () => {
    let found: LocalSave | null = null
    for (let seed = 1; seed < 200 && !found; seed++) {
      const s = autoUntilHuman(newLocalGame(gameData, setup(1, 0), T, seed))
      const r = applyLocal(gameData, s, { type: 'ROLL', actor: 'p1', now: T }, true, T)
      if (r.ok && r.save.present.phase === 'question' && gameData.questionById.get(r.save.present.turn.question!.id)!.answers.length > 2) found = r.save
    }
    if (!found) throw new Error('không tìm được ván có câu hỏi')
    expect(canUndo(found)).toBe(false)
    const present = structuredClone(found.present)
    present.players[0].bag = ['fiftyFifty', 'swap']
    const withBag: LocalSave = { ...found, present }
    const f = applyLocal(gameData, withBag, { type: 'USE_POWERUP', actor: 'p1', powerup: 'fiftyFifty', now: T + 500 }, true, T + 500)
    expect(f.ok && f.save.present.turn.question!.eliminated.length).toBeGreaterThan(0)
    expect(f.ok && canUndo(f.save)).toBe(false)
    const w = applyLocal(gameData, withBag, { type: 'USE_POWERUP', actor: 'p1', powerup: 'swap', now: T + 500 }, true, T + 500)
    expect(w.ok && canUndo(w.save)).toBe(false)
  })

  it('đã chốt câu hỏi (lộ đáp án) thì xóa lịch sử hoàn tác', () => {
    // tìm ván mà lần tung đầu của người rơi vào ô câu hỏi
    let found: LocalSave | null = null
    for (let seed = 1; seed < 200 && !found; seed++) {
      const s = autoUntilHuman(newLocalGame(gameData, setup(1, 0), T, seed))
      const r = applyLocal(gameData, s, { type: 'ROLL', actor: 'p1', now: T }, true, T)
      if (r.ok && r.save.present.phase === 'question') found = r.save
    }
    if (!found) throw new Error('không tìm được ván có câu hỏi')
    expect(canUndo(found)).toBe(false)
    const a = applyLocal(gameData, found, { type: 'ANSWER', actor: 'p1', choice: 0, now: T + 1000 }, true, T + 1000)
    expect(a.ok).toBe(true)
    const answered = (a as { save: LocalSave }).save
    expect(answered.present.phase).toBe('reveal')
    expect(canUndo(answered)).toBe(false)
  })

  it('tiếp tục ván đã lưu: dời mốc thời gian đúng bằng khoảng vắng mặt (không hoàn giờ khi tải lại)', () => {
    const s = newLocalGame(gameData, setup(2, 0), T, 1)
    // rời đi 1 giờ sau khi màn chơi còn mở tới T + 30 giây
    const seen = T + 30_000
    const later = T + 3_600_000
    const r = resumeLocal(s, later, seen)
    const delta = later - seen
    expect(r.present.endsAt).toBe(s.present.endsAt! + delta)
    expect(r.present.deadline).toBe(s.present.deadline! + delta)
    expect(r.present.startedAt).toBe(s.present.startedAt + delta)
    // tải lại ngay (vắng 1 giây): còn lại đúng như lúc rời đi, không được hoàn 30 giây đã trôi
    const quick = resumeLocal(s, seen + 1000, seen)
    expect(quick.present.endsAt! - (seen + 1000)).toBe(s.present.endsAt! - seen)
    // không có dấu "lần cuối thấy" → tính từ lúc lưu
    expect(resumeLocal(s, later).present.deadline).toBe(s.present.deadline! + (later - T))
  })

  it('lưu và đọc lại ván trên máy; xóa khi kết thúc', () => {
    const s = newLocalGame(gameData, setup(1, 1), T, 2)
    storeSave(s)
    expect(loadSave(gameData)).toEqual(s)
    clearSave()
    expect(loadSave(gameData)).toBeNull()
    // ván đã kết thúc không được lưu
    storeSave(s)
    storeSave({ ...s, present: { ...s.present, phase: 'ended' } })
    expect(loadSave(gameData)).toBeNull()
  })

  it('ván lưu không còn hợp lệ với dữ liệu hiện tại → bỏ, không làm hỏng trang', () => {
    const s = newLocalGame(gameData, setup(1, 1), T, 2)
    expect(isUsableSave(gameData, s)).toBe(true)
    expect(isUsableSave(gameData, null)).toBe(false)
    expect(isUsableSave(gameData, { v: 2 })).toBe(false)
    expect(isUsableSave(gameData, { ...s, present: { ...s.present, config: { ...s.present.config, layout: 'khong-co' } } })).toBe(false)
    const stale = structuredClone(s)
    stale.present.turn.question = { ...stale.present.turn.question, id: 'Q-KHONG-CO' } as never
    expect(isUsableSave(gameData, stale)).toBe(false)
    save(SAVE_KEY, stale)
    expect(loadSave(gameData)).toBeNull()
    expect(load(SAVE_KEY, 'đã xóa')).toBe('đã xóa')
    save(SAVE_KEY, '{không phải json')
    expect(loadSave(gameData)).toBeNull()
  })

  it('localStorage hỏng / bị chặn: không ném lỗi, game vẫn chạy', () => {
    ;(globalThis as { localStorage?: unknown }).localStorage = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('quota')
      },
      removeItem() {
        throw new Error('blocked')
      },
    }
    expect(save('x', 1)).toBe(false)
    expect(load('x', 7)).toBe(7)
    expect(() => storeSave(newLocalGame(gameData, setup(1, 0), T, 3))).not.toThrow()
    expect(loadSave(gameData)).toBeNull()
  })

  it('thử thách cá nhân: chỉ khi 1 người, 0 máy; kỷ lục chỉ lưu khi về đích và ít lượt hơn', () => {
    expect(isSoloChallenge(newLocalGame(gameData, setup(1, 0), T, 1).present)).toBe(true)
    expect(isSoloChallenge(newLocalGame(gameData, setup(1, 1), T, 1).present)).toBe(false)
    const st = structuredClone(newLocalGame(gameData, setup(1, 0), T, 1).present)
    const key = recordKey(st)
    // chưa về đích → không lưu
    let r = settleRecord(st, {})
    expect(r.result).toMatchObject({ turns: null, isNew: false })
    expect(r.records).toEqual({})
    st.players[0].finishRank = 1
    st.players[0].stats.turns = 14
    r = settleRecord(st, { [key]: 16 })
    expect(r.result).toMatchObject({ previous: 16, turns: 14, isNew: true })
    expect(r.records[key]).toBe(14)
    r = settleRecord(st, { [key]: 12 })
    expect(r.result).toMatchObject({ previous: 12, turns: 14, isNew: false })
    expect(r.records[key]).toBe(12)
    // kỷ lục tách theo bố cục / số ngựa / tùy chọn
    const dai = structuredClone(st)
    dai.config.layout = 'dai'
    expect(recordKey(dai)).not.toBe(key)
  })
})

describe('tiện ích chữ', () => {
  it('điền mẫu, đồng hồ, biệt danh 1–20 ký tự (cắt khoảng trắng)', () => {
    expect(fill('Lượt của {name}', { name: 'Lan' })).toBe('Lượt của Lan')
    expect(fill('{a} {b}', { a: 1 })).toBe('1 {b}')
    expect(clock(65_000)).toBe('1:05')
    expect(clock(-5)).toBe('0:00')
    expect(cleanNickname('  Lan   Anh ')).toBe('Lan Anh')
    expect(cleanNickname('   ')).toBeNull()
    expect(cleanNickname('a'.repeat(21))).toBeNull()
    expect(cleanNickname('Đặng Thị Ngọc Ánh Dươ')).toBeNull()
    expect(cleanNickname('Đặng Thị Ngọc Ánh')).toBe('Đặng Thị Ngọc Ánh')
    // ký tự vô hình / đổi chiều chữ / điều khiển (rà soát G6): bỏ đi; chỉ có chúng thì không hợp lệ
    expect(cleanNickname('\u200B\u202E')).toBeNull()
    expect(cleanNickname('\u0000\u0007')).toBeNull()
    expect(cleanNickname('Lan\u202Eabc')).toBe('Lan abc')
    expect(cleanNickname('Đức'.normalize('NFD'))).toBe('Đức'.normalize('NFD'))
  })
})
