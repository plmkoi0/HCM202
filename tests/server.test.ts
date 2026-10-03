// Server với kho giả lập trong bộ nhớ (mục 17 — Server): sức chứa, vào phòng, chủ phòng,
// quyền và đồng thời, chống gửi trùng, hạn thời gian, state không lộ đáp án, nối lại, hết hạn.
import { describe, expect, it } from 'vitest'
import { currentPlayer } from '../src/engine/reducer'
import { RoomError } from '../server/errors'
import { MemoryStore } from '../server/memoryStore'
import { RoomService } from '../server/rooms'
import type { ClientAction, Credentials, Room, StateView } from '../server/types'

const T = 1_800_000_000_000

function setup(latencyMs = 0) {
  let t = T
  const now = () => t
  const store = new MemoryStore(now, latencyMs)
  const svc = new RoomService({ store, now })
  return {
    store,
    svc,
    advance: (ms: number) => {
      t += ms
    },
    now,
  }
}

type Svc = RoomService

async function create(svc: Svc, capacity = 5, extra: Record<string, unknown> = {}): Promise<Credentials & { room: Room }> {
  const r = await svc.create({ name: 'Chủ', color: 0, capacity, ...extra }, 'ip')
  return { code: r.room.code, playerId: r.playerId, token: r.token, room: r.room }
}

async function join(svc: Svc, code: string, name: string, color: number): Promise<Credentials> {
  const r = await svc.join(code, { name, color }, 'ip')
  return { code, playerId: r.playerId, token: r.token }
}

let n = 0
async function act(svc: Svc, c: Credentials, action: ClientAction, id = `a${++n}`) {
  return svc.act(c, id, action)
}

async function errorOf(p: Promise<unknown>): Promise<string | null> {
  try {
    await p
    return null
  } catch (e) {
    if (e instanceof RoomError) return e.code
    throw e
  }
}

async function view(svc: Svc, c: Credentials): Promise<StateView> {
  return (await svc.state(c))!
}

/** Chơi tới khi người đang đến lượt là người (không phải máy) đang ở pha câu hỏi */
async function untilQuestion(ctx: ReturnType<typeof setup>, creds: Credentials[]): Promise<StateView> {
  for (let i = 0; i < 400; i++) {
    const v = await view(ctx.svc, creds[0]!)
    const g = v.game!
    if (g.phase === 'ended') throw new Error('ván kết thúc trước khi gặp câu hỏi')
    const cur = g.order[g.turnIndex]!
    const me = creds.find((c) => c.playerId === cur)
    if (g.phase === 'question' && me) return v
    if (me && g.phase === 'roll') await act(ctx.svc, me, { type: 'ROLL' })
    else if (me && g.phase === 'reveal') await act(ctx.svc, me, { type: 'NEXT_TURN' })
    else if (me && g.phase === 'chooseHorse') await act(ctx.svc, me, { type: 'CHOOSE_HORSE', horse: 0 })
    else if (me && g.phase === 'discard') await act(ctx.svc, me, { type: 'DISCARD_POWERUP', discard: 'new' })
    else {
      ctx.advance(20_000)
      await act(ctx.svc, creds[0]!, { type: 'TICK' })
    }
  }
  throw new Error('không tới được pha câu hỏi')
}

describe('Server — tạo và vào phòng', () => {
  it('tạo phòng: mã 5 ký tự không có 0/O/1/I/L, chủ phòng p1, xem trước thấy màu đã chọn', async () => {
    const { svc } = setup()
    const h = await create(svc)
    expect(h.code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{5}$/)
    expect(h.room.hostId).toBe('p1')
    expect(h.room.status).toBe('lobby')
    const p = await svc.peek(h.code.toLowerCase(), 'ip')
    expect(p).toMatchObject({ code: h.code, capacity: 5, seats: 1, takenColors: [0], status: 'lobby' })
    expect(await errorOf(svc.peek('ABCDE', 'ip'))).toBe('ROOM_NOT_FOUND')
    expect(await errorOf(svc.peek('AB0DE', 'ip'))).toBe('ROOM_NOT_FOUND')
  })

  it('kiểm tra đầu vào: biệt danh 1–20 ký tự, màu, số chỗ, cài đặt; bỏ qua hạn thời gian do máy gửi', async () => {
    const { svc } = setup()
    expect(await errorOf(svc.create({ name: '   ', color: 0, capacity: 5 }, 'ip'))).toBe('BAD_NAME')
    expect(await errorOf(svc.create({ name: 'a'.repeat(21), color: 0, capacity: 5 }, 'ip'))).toBe('BAD_NAME')
    expect(await errorOf(svc.create({ name: 'Lan', color: 6, capacity: 5 }, 'ip'))).toBe('BAD_REQUEST')
    expect(await errorOf(svc.create({ name: 'Lan', color: 0, capacity: 6 }, 'ip'))).toBe('BAD_REQUEST')
    expect(await errorOf(svc.create({ name: 'Lan', color: 0, capacity: 5, bots: 2 }, 'ip'))).toBe('BAD_REQUEST')
    expect(await errorOf(svc.create({ name: 'Lan', color: 0, capacity: 5, config: { timeLimitMin: 8 } }, 'ip'))).toBe('BAD_REQUEST')
    const ok = await create(svc, 5, { config: { timeLimitMin: 7, guessAlong: true, timers: { answerMs: 999_999 } } })
    expect(ok.room.config).toEqual({ timeLimitMin: 7, guessAlong: true })
  })

  it('6 người cùng vào phòng 5 chỗ → đúng 5 người, người thứ 6 nhận "phòng đã đủ người"', async () => {
    const { svc } = setup(2)
    const h = await create(svc, 5)
    const results = await Promise.allSettled([1, 2, 3, 4, 5].map((c) => svc.join(h.code, { name: `N${c}`, color: c }, 'ip')))
    const ok = results.filter((r) => r.status === 'fulfilled')
    const bad = results.filter((r) => r.status === 'rejected').map((r) => ((r as PromiseRejectedResult).reason as RoomError).code)
    expect(ok.length).toBe(4)
    expect(bad).toEqual(['ROOM_FULL'])
    const v = await view(svc, h)
    expect(v.room.members.length).toBe(5)
    expect(new Set(v.room.members.map((m) => m.color)).size).toBe(5)
  })

  it('nhiều người cùng chọn một màu → chỉ một người được', async () => {
    const { svc } = setup(2)
    const h = await create(svc, 5)
    const results = await Promise.allSettled([1, 2, 3].map((i) => svc.join(h.code, { name: `N${i}`, color: 3 }, 'ip')))
    expect(results.filter((r) => r.status === 'fulfilled').length).toBe(1)
    expect(results.filter((r) => r.status === 'rejected').map((r) => ((r as PromiseRejectedResult).reason as RoomError).code)).toEqual(['COLOR_TAKEN', 'COLOR_TAKEN'])
  })

  it('máy chơi cùng tính vào sức chứa; phòng 1 chỗ không nhận thêm', async () => {
    const { svc } = setup()
    const h = await create(svc, 3)
    await act(svc, h, { type: 'ADD_BOT' })
    await act(svc, h, { type: 'ADD_BOT' })
    expect(await errorOf(act(svc, h, { type: 'ADD_BOT' }))).toBe('ROOM_FULL')
    expect(await errorOf(svc.join(h.code, { name: 'Muộn', color: 5 }, 'ip'))).toBe('ROOM_FULL')
    const v = await view(svc, h)
    expect(v.room.members.filter((m) => m.isBot).map((m) => m.name)).toEqual(['Máy Sen', 'Máy Đào'])
    // phòng 1 chỗ: vào ván ngay (thử thách cá nhân), không ai vào thêm
    const solo = await create(svc, 1)
    expect(solo.room.status).toBe('playing')
    expect(await errorOf(svc.join(solo.code, { name: 'X', color: 4 }, 'ip'))).toBe('ROOM_FULL')
    // phòng 1 chỗ + 2 máy chơi cùng
    const withBots = await create(svc, 1, { bots: 2 })
    expect(withBots.room.status).toBe('playing')
    expect(withBots.room.game!.players.map((p) => p.isBot)).toEqual([false, true, true])
  })

  it('bắt đầu được với 1 người; sau khi bắt đầu không nhận người mới, người cũ vẫn nối lại được', async () => {
    const { svc } = setup()
    const h = await create(svc, 5)
    const p2 = await join(svc, h.code, 'Minh', 1)
    expect(await errorOf(act(svc, p2, { type: 'START' }))).toBe('NOT_HOST')
    await act(svc, h, { type: 'START' })
    expect(await errorOf(svc.join(h.code, { name: 'Muộn', color: 4 }, 'ip'))).toBe('ROOM_STARTED')
    const v = await view(svc, p2)
    expect(v.room.status).toBe('playing')
    expect(v.you).toBe('p2')
    expect(await errorOf(svc.state({ ...p2, token: 'sai' }))).toBe('UNAUTHORIZED')
    // một mình cũng bắt đầu được
    const alone = await create(svc, 5)
    await act(svc, alone, { type: 'START' })
    expect((await view(svc, alone)).game!.players.length).toBe(1)
  })
})

describe('Server — chủ phòng, quyền, đồng thời', () => {
  it('chủ phòng rời → quyền chuyển cho người vào sớm nhất còn kết nối', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    ctx.advance(10)
    const p2 = await join(ctx.svc, h.code, 'Hai', 1)
    ctx.advance(10)
    const p3 = await join(ctx.svc, h.code, 'Ba', 2)
    // p2 im lặng 30 s (không WebSocket, không poll) → coi là mất kết nối; p3 vẫn poll
    ctx.advance(30_000)
    await ctx.svc.state(p3)
    await act(ctx.svc, h, { type: 'LEAVE' })
    const v = await view(ctx.svc, p3)
    expect(v.room.hostId).toBe('p3')
    expect(v.room.members.map((m) => [m.id, m.connected])).toEqual([
      ['p2', false],
      ['p3', true],
    ])
    // p2 quay lại (poll) → kết nối lại, nhưng chủ phòng giữ nguyên
    const v2 = await view(ctx.svc, p2)
    expect(v2.room.members.find((m) => m.id === 'p2')!.connected).toBe(true)
    expect(v2.room.hostId).toBe('p3')
  })

  it('chủ phòng rời khi đang chơi: chuyển quyền; mọi người rời thì phòng đóng', async () => {
    const { svc } = setup()
    const h = await create(svc, 5)
    const p2 = await join(svc, h.code, 'Hai', 1)
    await act(svc, h, { type: 'START' })
    await act(svc, h, { type: 'LEAVE' })
    let v = await view(svc, p2)
    expect(v.room.hostId).toBe('p2')
    expect(v.game!.players.find((p) => p.id === 'p1')!.connected).toBe(false)
    await act(svc, p2, { type: 'LEAVE' })
    v = (await svc.state(p2))!
    expect(v.room.status).toBe('closed')
    expect(await errorOf(act(svc, p2, { type: 'TICK' }))).toBe('ROOM_CLOSED')
  })

  it('từ chối: không phải chủ phòng, sai lượt, dùng power-up không có, mời người ra', async () => {
    const ctx = setup()
    const { svc } = ctx
    const h = await create(svc, 5)
    const p2 = await join(svc, h.code, 'Hai', 1)
    expect(await errorOf(act(svc, p2, { type: 'ADD_BOT' }))).toBe('NOT_HOST')
    expect(await errorOf(act(svc, p2, { type: 'SET_CONFIG', config: { layout: 'dai' } }))).toBe('NOT_HOST')
    expect(await errorOf(act(svc, p2, { type: 'KICK', playerId: 'p1' }))).toBe('NOT_HOST')
    await act(svc, h, { type: 'START' })
    const g = (await view(svc, h)).game!
    const cur = g.order[g.turnIndex]
    const other = cur === 'p1' ? p2 : h
    const me = cur === 'p1' ? h : p2
    expect(await errorOf(act(svc, other, { type: 'ROLL' }))).toBe('NOT_YOUR_TURN')
    expect(await errorOf(act(svc, me, { type: 'USE_POWERUP', powerup: 'double' }))).toBe('NO_POWERUP')
    expect(await errorOf(act(svc, me, { type: 'USE_POWERUP', powerup: 'xyz' as never }))).toBe('BAD_REQUEST')
    expect(await errorOf(act(svc, me, { type: 'FLY' } as never))).toBe('UNKNOWN_ACTION')
    // mời ra (ở phòng chờ)
    const r2 = await create(svc, 5)
    const k = await join(svc, r2.code, 'Khách', 3)
    await act(svc, r2, { type: 'KICK', playerId: k.playerId })
    expect(await errorOf(svc.state(k))).toBe('KICKED')
    expect(await errorOf(svc.join(r2.code, { name: 'Khách', color: 3 }, 'ip'))).toBeNull()
  })

  it('hai instance dùng chung kho: bộ nhớ đệm cũ không gây từ chối sai (lỗi tìm thấy khi mô phỏng tải)', async () => {
    const ctx = setup()
    const other = new RoomService({ store: ctx.store, now: ctx.now })
    const h = await create(ctx.svc, 5)
    await ctx.svc.peek(h.code, 'ip')
    // instance thứ hai nhận người mới và bắt đầu ván; instance đầu vẫn giữ bản phòng cũ trong bộ nhớ đệm
    const p2 = (await other.join(h.code, { name: 'Hai', color: 1 }, 'ip')) as unknown as { playerId: string; token: string }
    const c2 = { code: h.code, playerId: p2.playerId, token: p2.token }
    expect(ctx.svc.cached(h.code)!.members.length).toBe(1)
    await other.act(h, 'x-start', { type: 'START' })
    // người mới gửi hành động qua instance đầu: không bị "phiên không hợp lệ" / "sai pha"
    const v = (await ctx.svc.state(c2))!
    const cur = v.game!.order[v.game!.turnIndex]!
    const r = await ctx.svc.act(cur === 'p1' ? h : c2, 'x-roll', { type: 'ROLL' })
    expect(r.room.game!.turn.roll).not.toBeNull()
  })

  it('rời phòng giữa ván: poll / TICK sau đó không xóa "đã rời"; mọi người rời thì phòng đóng (rà soát G3)', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    const p2 = await join(ctx.svc, h.code, 'Hai', 1)
    await act(ctx.svc, h, { type: 'START' })
    await act(ctx.svc, p2, { type: 'LEAVE' })
    await ctx.svc.state(p2)
    await act(ctx.svc, p2, { type: 'TICK' }).catch(() => null)
    let stored = (await ctx.store.get(h.code))!
    expect(stored.members.find((m) => m.id === 'p2')!.left).toBe(true)
    await act(ctx.svc, h, { type: 'LEAVE' })
    stored = (await ctx.store.get(h.code))!
    expect(stored.status).toBe('closed')
  })

  it('token sai không làm khóa hành động của người chơi thật; bố cục là khóa prototype bị từ chối (rà soát G3)', async () => {
    const { svc } = setup()
    const h = await create(svc, 5)
    for (let i = 0; i < 80; i++) expect(await errorOf(svc.act({ ...h, token: 'sai' }, `x${i}`, { type: 'ADD_BOT' }))).toBe('UNAUTHORIZED')
    expect(await errorOf(act(svc, h, { type: 'ADD_BOT' }))).toBeNull()
    expect(await errorOf(act(svc, h, { type: 'SET_CONFIG', config: { layout: 'toString' } }))).toBe('BAD_REQUEST')
    expect(await errorOf(svc.create({ name: 'A', color: 0, capacity: 1, config: { layout: '__proto__' } }, 'ip'))).toBe('BAD_REQUEST')
  })

  it('actionId gửi trùng không áp dụng hai lần', async () => {
    const { svc } = setup()
    const h = await create(svc, 5)
    const a = await svc.act(h, 'cung-mot-id', { type: 'ADD_BOT' })
    const b = await svc.act(h, 'cung-mot-id', { type: 'ADD_BOT' })
    expect(a.duplicate).toBe(false)
    expect(b.duplicate).toBe(true)
    expect(b.room.version).toBe(a.room.version)
    expect(b.room.members.filter((m) => m.isBot).length).toBe(1)
    // gửi đồng thời cùng một actionId cũng chỉ áp dụng một lần
    const both = await Promise.all([svc.act(h, 'id-2', { type: 'ADD_BOT' }), svc.act(h, 'id-2', { type: 'ADD_BOT' })])
    expect(both.map((x) => x.duplicate).sort()).toEqual([false, true])
    expect((await view(svc, h)).room.members.filter((m) => m.isBot).length).toBe(2)
  })

  it('nhiều hành động đồng thời không mất dữ liệu', async () => {
    const { svc } = setup(3)
    const h = await create(svc, 5)
    const ps: Credentials[] = [h]
    for (let i = 1; i < 5; i++) ps.push(await join(svc, h.code, `N${i}`, i))
    // mỗi người đổi sang một màu khác cùng lúc với chủ phòng đổi cài đặt
    await Promise.all([
      act(svc, ps[1]!, { type: 'SET_COLOR', color: 5 }),
      act(svc, ps[2]!, { type: 'SET_NAME' } as never).catch(() => null),
      act(svc, h, { type: 'SET_CONFIG', config: { layout: 'dai' } }),
      act(svc, h, { type: 'SET_CONFIG', config: { timeLimitMin: 5 } }),
      act(svc, ps[3]!, { type: 'SET_COLOR', color: 3 }),
    ])
    const v = await view(svc, h)
    expect(v.room.config).toEqual({ layout: 'dai', timeLimitMin: 5 })
    expect(v.room.members.find((m) => m.id === 'p2')!.color).toBe(5)
  })

  it('Đoán cùng: mọi người đoán cùng lúc đều được ghi; người đang trả lời không thấy người khác đoán', async () => {
    const ctx = setup(2)
    const h = await create(ctx.svc, 4, { config: { guessAlong: true } })
    const ps: Credentials[] = [h]
    for (let i = 1; i < 4; i++) ps.push(await join(ctx.svc, h.code, `N${i}`, i))
    await act(ctx.svc, h, { type: 'START' })
    const v = await untilQuestion(ctx, ps)
    const cur = v.game!.order[v.game!.turnIndex]
    const guessers = ps.filter((c) => c.playerId !== cur)
    await Promise.all(guessers.map((c, i) => act(ctx.svc, c, { type: 'GUESS', choice: i % 2 })))
    const answerer = ps.find((c) => c.playerId === cur)!
    const mine = await view(ctx.svc, answerer)
    expect(mine.game!.turn.guesses).toEqual({})
    const g1 = await view(ctx.svc, guessers[0]!)
    expect(Object.keys(g1.game!.turn.guesses)).toEqual([guessers[0]!.playerId])
    // trong kho: đủ 3 lựa chọn
    const stored = (await ctx.store.get(h.code))!
    expect(Object.keys(stored.game!.turn.guesses).sort()).toEqual(guessers.map((c) => c.playerId).sort())
  })
})

describe('Server — hạn thời gian, trạng thái, nối lại, hết hạn', () => {
  it('hành động tự động (TICK) trước hạn bị từ chối; quá hạn thì server tự chọn hành động', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    await act(ctx.svc, h, { type: 'ADD_BOT' })
    await act(ctx.svc, h, { type: 'START' })
    let g = (await view(ctx.svc, h)).game!
    // ép tới lượt người: nếu máy đi trước thì quá hạn để máy đi
    for (let i = 0; i < 50 && currentPlayerId(g) !== 'p1'; i++) {
      expect(await errorOf(act(ctx.svc, h, { type: 'TICK' }))).toBe('TOO_EARLY')
      ctx.advance(g.deadline! - ctx.now() + 1)
      await act(ctx.svc, h, { type: 'TICK' })
      g = (await view(ctx.svc, h)).game!
    }
    expect(g.phase).toBe('roll')
    expect(await errorOf(act(ctx.svc, h, { type: 'TICK' }))).toBe('TOO_EARLY')
    ctx.advance(g.deadline! - ctx.now())
    await act(ctx.svc, h, { type: 'TICK' })
    g = (await view(ctx.svc, h)).game!
    expect(g.turn.roll).not.toBeNull()
    expect(g.log.some((e) => e.type === 'rolled')).toBe(true)
  })

  it('sang lượt sớm: chỉ người đến lượt; người khác phải chờ hết giờ hiện giải thích', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    const p2 = await join(ctx.svc, h.code, 'Hai', 1)
    await act(ctx.svc, h, { type: 'START' })
    const ps = [h, p2]
    let g = (await view(ctx.svc, h)).game!
    for (let i = 0; i < 100 && g.phase !== 'reveal'; i++) {
      const cur = ps.find((c) => c.playerId === currentPlayerId(g))!
      if (g.phase === 'roll') await act(ctx.svc, cur, { type: 'ROLL' })
      else if (g.phase === 'question') await act(ctx.svc, cur, { type: 'ANSWER', choice: 0 })
      else {
        ctx.advance(20_000)
        await act(ctx.svc, h, { type: 'TICK' })
      }
      g = (await view(ctx.svc, h)).game!
    }
    expect(g.phase).toBe('reveal')
    const cur = ps.find((c) => c.playerId === currentPlayerId(g))!
    const other = ps.find((c) => c !== cur)!
    expect(await errorOf(act(ctx.svc, other, { type: 'NEXT_TURN' }))).toBe('TOO_EARLY')
    await act(ctx.svc, cur, { type: 'NEXT_TURN' })
    expect((await view(ctx.svc, h)).game!.phase).not.toBe('reveal')
  })

  it('state gửi xuống không chứa seed, RNG, đáp án đúng trước khi chốt', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    const p2 = await join(ctx.svc, h.code, 'Hai', 1)
    await act(ctx.svc, h, { type: 'START' })
    const v = await untilQuestion(ctx, [h, p2])
    const text = JSON.stringify(v)
    expect(v.game).not.toHaveProperty('seed')
    expect(v.game).not.toHaveProperty('rng')
    expect(text).not.toContain('correctIndex')
    expect(text).not.toContain('tokenHash')
    expect(v.game!.turn.outcome).toBeNull()
    expect(Object.keys(v.game!.turn.question!).sort()).toEqual(['difficulty', 'eliminated', 'fiftyFiftyUsed', 'id', 'isFinish', 'order', 'pillar', 'swapUsed', 'wantDifficulty', 'wantPillar'])
  })

  it('polling: không đổi → null (204); nối lại nhận đúng ảnh chụp mới nhất', async () => {
    const { svc } = setup()
    const h = await create(svc, 5)
    const v1 = await view(svc, h)
    expect(await svc.state(h, v1.version)).toBeNull()
    const p2 = await join(svc, h.code, 'Hai', 1)
    const v2 = (await svc.state(h, v1.version))!
    expect(v2.version).toBeGreaterThan(v1.version)
    expect(v2.room.members.map((m) => m.id)).toEqual(['p1', 'p2'])
    // "tải lại trang": không có since → ảnh chụp đầy đủ, cùng version với người khác thấy
    const fresh = await view(svc, p2)
    expect(fresh.version).toBe(v2.version)
    expect(fresh.you).toBe('p2')
  })

  it('mất kết nối: không WebSocket, không poll 20 s → đánh dấu mất kết nối; tới lượt thì tự bỏ lượt', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    const p2 = await join(ctx.svc, h.code, 'Hai', 1)
    const link = await ctx.svc.linkOpen(h, 'L1')
    expect(link.members[0]!.links).toHaveProperty('L1')
    await act(ctx.svc, h, { type: 'START' })
    ctx.advance(25_000)
    // một lần ghi bất kỳ → rà trạng thái kết nối
    await ctx.svc.state(h)
    await act(ctx.svc, h, { type: 'TICK' }).catch(() => null)
    const stored = (await ctx.store.get(h.code))!
    expect(stored.members.find((m) => m.id === 'p2')!.connected).toBe(false)
    expect(stored.game!.players.find((p) => p.id === 'p2')!.connected).toBe(false)
    expect(stored.members.find((m) => m.id === 'p1')!.connected).toBe(true)
    // p2 quay lại → nối lại, chơi tiếp ở vị trí cũ
    const back = await view(ctx.svc, p2)
    expect(back.game!.players.find((p) => p.id === 'p2')!.connected).toBe(true)
    // kết nối WebSocket đóng → chờ 20 s rồi mới tính là mất
    await ctx.svc.linkClose(h.code, 'p1', 'L1')
    ctx.advance(5000)
    await act(ctx.svc, p2, { type: 'TICK' }).catch(() => null)
    expect((await ctx.store.get(h.code))!.members[0]!.connected).toBe(true)
  })

  it('phòng hết hạn sau 6 giờ: báo "đã hết hạn", sau đó "không tìm thấy"', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    ctx.advance(6 * 3600_000)
    expect(await errorOf(ctx.svc.state(h))).toBe('ROOM_EXPIRED')
    expect(await errorOf(ctx.svc.join(h.code, { name: 'X', color: 3 }, 'ip'))).toBe('ROOM_EXPIRED')
    ctx.advance(11 * 60_000)
    expect(await errorOf(ctx.svc.state(h))).toBe('ROOM_NOT_FOUND')
    expect(ctx.store.size()).toBe(0)
  })

  it('kết thúc ván → chơi lại về phòng chờ, giữ người và máy, bỏ người đã rời', async () => {
    const ctx = setup()
    const h = await create(ctx.svc, 5)
    const p2 = await join(ctx.svc, h.code, 'Hai', 1)
    const p3 = await join(ctx.svc, h.code, 'Ba', 2)
    await act(ctx.svc, h, { type: 'ADD_BOT' })
    await act(ctx.svc, h, { type: 'START' })
    expect(await errorOf(act(ctx.svc, h, { type: 'REMATCH' }))).toBe('WRONG_PHASE')
    await act(ctx.svc, p3, { type: 'LEAVE' })
    expect(await errorOf(act(ctx.svc, p2, { type: 'END' }))).toBe('NOT_HOST')
    await act(ctx.svc, h, { type: 'END' })
    let v = await view(ctx.svc, h)
    expect(v.room.status).toBe('ended')
    expect(v.game!.ended!.reason).toBe('host')
    expect(await errorOf(act(ctx.svc, h, { type: 'TICK' }))).toBe('GAME_ENDED')
    await act(ctx.svc, h, { type: 'REMATCH' })
    v = await view(ctx.svc, h)
    expect(v.room.status).toBe('lobby')
    expect(v.game).toBeNull()
    expect(v.room.members.map((m) => m.id)).toEqual(['p1', 'p2', 'p4'])
    await act(ctx.svc, h, { type: 'START' })
    expect((await view(ctx.svc, p2)).room.round).toBe(2)
  })
})

function currentPlayerId(g: NonNullable<StateView['game']>): string {
  return g.order[g.turnIndex]!
}

// dùng để chắc chắn kiểu GameState của engine khớp ClientState (biên dịch)
void currentPlayer
