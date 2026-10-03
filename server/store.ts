// Kho phòng (mục 15.4): giao diện chung cho Redis thật (Upstash, redisStore.ts) và bản giả lập
// trong bộ nhớ (memoryStore.ts). Lõi server chỉ nói chuyện với giao diện này.
//
// Khóa (Redis, có "hash tag" {…} để các khóa của một phòng nằm cùng chỗ):
// r:{CODE} = phòng (JSON) · r:{CODE}:v = version (polling chỉ đọc khóa này)
// · r:{CODE}:s = lần poll gần nhất của từng người (hash) · kênh pub/sub room:CODE = phòng mới.

import type { Room } from './types.js'

export interface StoreStats {
  /** số lệnh gửi tới kho theo "LỆNH:việc" (để ước lượng chi phí — mục 15.5); khóa trong ngoặc
   *  là số liệu phụ, không phải lệnh */
  commands: Record<string, number>
  /** số tin pub/sub đã nhận (mỗi instance đang theo dõi phòng nhận một tin) */
  received: number
}

export interface RoomStore {
  readonly kind: 'memory' | 'redis'
  /** Đọc phòng; null nếu không có (hoặc đã hết hạn) */
  get(code: string): Promise<Room | null>
  /** Đọc version (1 lệnh, dùng cho polling); null nếu không có */
  version(code: string): Promise<number | null>
  /**
   * Ghi phòng nếu version đang lưu bằng `expected` (0 = chưa có phòng), đặt hạn `ttlMs`,
   * rồi phát phòng mới cho mọi instance đang theo dõi. false = có người ghi trước → đọc lại, thử lại.
   */
  put(room: Room, expected: number, ttlMs: number): Promise<boolean>
  /** Ghi "lần gọi gần nhất" của người đang dùng polling (không phải nhịp tim WebSocket) */
  touch(code: string, playerId: string, at: number, ttlMs: number): Promise<void>
  seen(code: string): Promise<Record<string, number>>
  /** Theo dõi phòng (pub/sub); trả hàm hủy */
  subscribe(code: string, listener: (room: Room) => void): Promise<() => Promise<void>>
  /** Đếm số lần trong cửa sổ thời gian (giới hạn tần suất dùng chung giữa các instance); true = còn trong hạn mức */
  hit(key: string, limit: number, windowMs: number): Promise<boolean>
  /** Kiểm tra kết nối; trả số mili-giây */
  ping(): Promise<number>
  close(): Promise<void>
  stats(): StoreStats
}

export const roomKey = (code: string) => `r:{${code}}`
export const versionKey = (code: string) => `r:{${code}}:v`
export const seenKey = (code: string) => `r:{${code}}:s`
export const channelOf = (code: string) => `room:${code}`
