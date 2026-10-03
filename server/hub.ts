// Phát trạng thái tới các kết nối WebSocket đang mở trên instance này (mục 15.4): mỗi phòng
// có kết nối thì instance theo dõi kênh pub/sub của phòng một lần; tin mới → gửi ảnh chụp
// riêng cho từng người (ẩn lựa chọn Đoán cùng của người khác).

import type { RoomService } from './rooms.js'
import type { Room } from './types.js'

export interface HubClient {
  readonly playerId: string
  push(room: Room): void
}

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
      entry.unsubscribe = this.service.store
        .subscribe(code, (room) => this.deliver(room))
        .then(async (unsub) => {
          // có thể đã lỡ tin giữa lúc mở kết nối và lúc theo dõi xong → đọc lại một lần
          const latest = await this.service.store.get(code).catch(() => null)
          if (latest) this.deliver(latest)
          return unsub
        })
        .catch((err: unknown) => {
          console.error('[hub] không theo dõi được phòng', code, err)
          return null
        })
      this.rooms.set(code, entry)
      e = entry
    }
    e.clients.add(client)
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
