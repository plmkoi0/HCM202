// Trạng thái kết nối (mục 9, 15.5): lấy từ sự kiện mở/đóng WebSocket và lần gọi gần nhất —
// không ghi nhịp tim WebSocket vào Redis. Người dùng polling ghi "lần poll gần nhất" (thưa,
// tối đa 10 giây một lần) vào hash riêng. Cờ `connected` chỉ đổi khi có lần ghi phòng (lười),
// rồi đồng bộ sang engine bằng SET_CONNECTED; chủ phòng mất kết nối thì chuyển quyền.

import { applyAction } from '../src/engine/reducer.js'
import type { GameData } from '../src/engine/types.js'
import type { Member, Room } from './types.js'

export interface PresenceOptions {
  /** kết nối WebSocket mở lâu hơn mức này coi như đã chết (Vercel đóng ở 300 s, client nối lại trước đó) */
  linkMaxAgeMs: number
  /** sau khi kết nối cuối cùng đóng, chờ bấy lâu (client nối lại / chuyển sang polling) */
  lostGraceMs: number
  /** không thấy gọi (hành động, poll) trong bấy lâu thì coi là mất kết nối */
  seenGraceMs: number
}

export const DEFAULT_PRESENCE: PresenceOptions = { linkMaxAgeMs: 320_000, lostGraceMs: 20_000, seenGraceMs: 20_000 }

function liveLink(m: Member, now: number, o: PresenceOptions): boolean {
  return Object.values(m.links).some((at) => now - at < o.linkMaxAgeMs)
}

/** Có mặt mà không cần đọc hash poll? (kết nối sống, vừa gọi, vừa rớt kết nối) */
function presentWithoutSeen(m: Member, now: number, o: PresenceOptions): boolean {
  return liveLink(m, now, o) || now - m.lastSeen < o.seenGraceMs || (m.lostAt !== null && now - m.lostAt < o.lostGraceMs)
}

export function isPresent(m: Member, seenAt: number | undefined, now: number, o: PresenceOptions): boolean {
  return presentWithoutSeen(m, now, o) || (seenAt !== undefined && now - seenAt < o.seenGraceMs)
}

/** Cần đọc hash poll để quyết định không (có người đang hiện "kết nối" mà không có dấu hiệu gần đây) */
export function needsSeen(room: Room, now: number, o: PresenceOptions, exceptId?: string): boolean {
  return room.members.some((m) => !m.isBot && m.connected && m.id !== exceptId && !presentWithoutSeen(m, now, o))
}

/** Đổi cờ kết nối của một người, đồng bộ sang engine (sự kiện "mất kết nối" / "đã nối lại") */
export function setConnected(room: Room, data: GameData, m: Member, connected: boolean, now: number): void {
  if (m.connected === connected) return
  m.connected = connected
  if (room.game && room.game.phase !== 'ended' && room.game.players.some((p) => p.id === m.id)) {
    const r = applyAction(data, room.game, { type: 'SET_CONNECTED', playerId: m.id, connected, now })
    if (r.ok) room.game = r.state
  }
}

/** Chủ phòng rời / mất kết nối → chuyển cho người vào sớm nhất còn kết nối (mục 9) */
export function transferHost(room: Room): boolean {
  const host = room.members.find((m) => m.id === room.hostId)
  if (host && !host.isBot && host.connected && !host.left) return false
  const next = room.members
    .filter((m) => !m.isBot && m.connected && !m.left)
    .sort((a, b) => a.joinedAt - b.joinedAt || Number(a.id.slice(1)) - Number(b.id.slice(1)))[0]
  if (!next || next.id === room.hostId) return false
  room.hostId = next.id
  return true
}

/**
 * Rà trạng thái kết nối trước mỗi lần ghi phòng: bỏ kết nối đã chết, đánh dấu người vắng mặt,
 * chuyển chủ phòng. `exceptId` = người đang gửi yêu cầu (chắc chắn có mặt). Trả true nếu có đổi.
 */
export function sweepPresence(room: Room, data: GameData, seen: Record<string, number>, now: number, o: PresenceOptions, exceptId?: string): boolean {
  let changed = false
  for (const m of room.members) {
    if (m.isBot) continue
    for (const [id, at] of Object.entries(m.links)) {
      if (now - at >= o.linkMaxAgeMs) {
        delete m.links[id]
        m.lostAt = Math.max(m.lostAt ?? 0, at + o.linkMaxAgeMs)
        changed = true
      }
    }
    if (m.id === exceptId || !m.connected) continue
    if (!isPresent(m, seen[m.id], now, o)) {
      setConnected(room, data, m, false, now)
      changed = true
    }
  }
  if (room.status !== 'closed' && transferHost(room)) changed = true
  return changed
}
