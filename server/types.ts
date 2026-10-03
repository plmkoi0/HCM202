// Kiểu dữ liệu phòng chơi (mục 9, 15.4). Phòng lưu nguyên khối trong kho (Redis / bộ nhớ),
// ghi có kiểm tra `version`; ván chơi là GameState của engine nằm trong phòng.

import type { AfterFirstFinish, ClientState, GameState, PowerupId } from '../src/engine/index.js'

export type RoomStatus = 'lobby' | 'playing' | 'ended' | 'closed'

/** Cài đặt ván chủ phòng chỉnh được — không gồm hạn thời gian từng pha (do server quyết) */
export interface RoomConfig {
  layout?: string
  timeLimitMin?: number | null
  exactFinish?: boolean
  startFromStable?: boolean
  horsesPerPlayer?: number
  guessAlong?: boolean
  afterFirstFinish?: AfterFirstFinish
}

export interface Member {
  /** p1, p2… — trùng với id người chơi trong engine */
  id: string
  name: string
  color: number
  isBot: boolean
  joinedAt: number
  /** sha256(token) — máy chơi cùng không có token */
  tokenHash: string | null
  /** trạng thái kết nối đang hiển thị (đồng bộ với engine bằng SET_CONNECTED) */
  connected: boolean
  /** kết nối WebSocket đang mở: mã kết nối → lúc mở (kết nối quá 320 s coi như đã chết — Vercel đóng ở 300 s) */
  links: Record<string, number>
  /** lúc kết nối WebSocket cuối cùng đóng */
  lostAt: number | null
  /** lần gần nhất người này gửi yêu cầu có ghi vào phòng (vào phòng, hành động, mở/đóng kết nối) */
  lastSeen: number
  /** đã bấm rời phòng khi ván đang chơi (vẫn nối lại được) */
  left: boolean
}

/** actionId đã áp dụng thành công (chống gửi trùng) */
export interface RecentAction {
  id: string
  by: string
  v: number
}

export interface Room {
  /** 2 = bản 1.6 (game không còn trụ cột / giải thích); phòng định dạng cũ coi như không có */
  schema: 2
  code: string
  /** tăng 1 mỗi lần ghi */
  version: number
  createdAt: number
  /** phòng tự xóa sau 6 giờ (mục 9) */
  expiresAt: number
  status: RoomStatus
  /** số chỗ tối đa (người + máy), 1–5; phòng 1 chỗ vào ván ngay */
  capacity: number
  hostId: string
  config: RoomConfig
  members: Member[]
  /** id người chơi tiếp theo (p{nextId}) */
  nextId: number
  /** người đã bị mời ra (token không còn dùng được) */
  kicked: string[]
  /** số ván đã bắt đầu trong phòng (chơi lại → +1) */
  round: number
  game: GameState | null
  recent: RecentAction[]
}

// ---------- Gửi xuống máy người chơi ----------

export interface MemberView {
  id: string
  name: string
  color: number
  isBot: boolean
  connected: boolean
  isHost: boolean
  left: boolean
}

export interface RoomView {
  code: string
  status: RoomStatus
  capacity: number
  hostId: string
  config: RoomConfig
  members: MemberView[]
  round: number
  expiresAt: number
}

/** Ảnh chụp trạng thái cho một người xem (polling và WebSocket trả cùng dạng) */
export interface StateView {
  version: number
  serverNow: number
  you: string
  room: RoomView
  game: ClientState | null
}

/** Thông tin công khai trước khi vào phòng (màn Vào phòng: màu còn trống, phòng còn chỗ không) */
export interface RoomPeek {
  code: string
  status: RoomStatus
  capacity: number
  seats: number
  takenColors: number[]
  expiresAt: number
  serverNow: number
}

// ---------- Hành động từ máy người chơi ----------

export type ClientAction =
  // phòng chờ
  | { type: 'SET_CONFIG'; config: RoomConfig }
  | { type: 'SET_CAPACITY'; capacity: number }
  | { type: 'ADD_BOT' }
  | { type: 'REMOVE_BOT'; playerId: string }
  | { type: 'KICK'; playerId: string }
  | { type: 'SET_COLOR'; color: number }
  | { type: 'START' }
  | { type: 'LEAVE' }
  | { type: 'REMATCH' }
  | { type: 'END' }
  // trong ván
  | { type: 'ROLL' }
  | { type: 'CHOOSE_HORSE'; horse: number }
  | { type: 'ANSWER'; choice: number }
  | { type: 'GUESS'; choice: number }
  | { type: 'USE_POWERUP'; powerup: PowerupId }
  | { type: 'DISCARD_POWERUP'; discard: PowerupId | 'new' }
  | { type: 'NEXT_TURN' }
  /** quá hạn: server tự chọn hành động tự động đang chờ (tự tung, hết giờ, bỏ lượt, bước của máy) */
  | { type: 'TICK' }

export type ClientActionType = ClientAction['type']

export interface CreateRoomInput {
  name: string
  color: number
  capacity: number
  config?: RoomConfig
  /** phòng 1 chỗ: số máy chơi cùng (0–4), vào ván ngay */
  bots?: number
}

export interface JoinRoomInput {
  name: string
  color: number
}

export interface Credentials {
  code: string
  playerId: string
  token: string
}
