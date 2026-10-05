// Phát trạng thái tới các kết nối WebSocket đang mở trên instance này (mục 15.4): mỗi phòng
// có kết nối thì instance theo dõi kênh pub/sub của phòng một lần; tin mới → gửi ảnh chụp
// riêng cho từng người (ẩn lựa chọn Đoán cùng của người khác).

import type { RoomService } from './rooms.js'
import type { Room } from './types.js'

export interface HubClient {
  readonly playerId: string
  push(room: Room): void
}

/** thử theo dõi lại sau lỗi: 1 s, 2 s, 4 s… tối đa 10 s */
export const HUB_RETRY_MS = 1000
export const HUB_RETRY_MAX_MS = 10_000

interface Entry {
  clients: Set<HubClient>
  unsubscribe: Promise<(() => Promise<void>) | null>
}

export class Hub {
  private rooms = new Map<string, Entry>()
  private service: RoomService

  constructor(service: RoomService) {
    this.service = service
    service.onWrite = (room) => this.deliver(room)
  }

  /** Có phòng mới (do instance này ghi, hoặc nhận qua pub/sub) */
  deliver(room: Room): void {
    this.service.remember(room)
    const e = this.rooms.get(room.code)
    if (!e) return
    for (const c of e.clients) c.push(room)
  }

  add(code: string, client: HubClient): void {
    let e = this.rooms.get(code)
    if (!e) {
      const entry: Entry = { clients: new Set(), unsubscribe: Promise.resolve(null) }
      this.rooms.set(code, entry)
      this.follow(code, entry, 0)
      e = entry
    }
    e.clients.add(client)
  }

  /**
   * Theo dõi kênh pub/sub của phòng. Lỗi (Redis chập chờn) thì thử lại sau 1, 2, 4… tối đa 10 s
   * chừng nào phòng còn kết nối trên instance này — không để máy hiện "Trực tiếp" mà chỉ nhận
   * nước đi qua lượt hỏi 30 giây.
   */
  private follow(code: string, entry: Entry, attempt: number): void {
    entry.unsubscribe = this.service.store
      .subscribe(code, (room) => this.deliver(room))
      .then(async (unsub) => {
        // có thể đã lỡ tin giữa lúc mở kết nối và lúc theo dõi xong → đọc lại một lần
        const latest = await this.service.store.get(code).catch(() => null)
        if (latest) this.deliver(latest)
        return unsub
      })
      .catch((err: unknown) => {
        console.error('[hub] không theo dõi được phòng', code, err instanceof Error ? err.message : err)
        const delay = Math.min(HUB_RETRY_MAX_MS, HUB_RETRY_MS * 2 ** attempt)
        const t = setTimeout(() => {
          if (this.rooms.get(code) === entry && entry.clients.size > 0) this.follow(code, entry, attempt + 1)
        }, delay)
        ;(t as { unref?: () => void }).unref?.()
        return null
      })
  }

  remove(code: string, client: HubClient): void {
    const e = this.rooms.get(code)
    if (!e) return
    e.clients.delete(client)
    if (e.clients.size > 0) return
    this.rooms.delete(code)
    void e.unsubscribe.then((u) => u?.()).catch(() => {})
  }

  /** số kết nối đang mở (cho kiểm tra sức khỏe / test) */
  size(): number {
    let n = 0
    for (const e of this.rooms.values()) n += e.clients.size
    return n
  }
}
