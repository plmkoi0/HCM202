// Đo độ lệch đồng hồ máy so với server (mục 15.4): mỗi phản hồi có `serverNow`; lấy mẫu có thời
// gian khứ hồi ngắn nhất trong vài mẫu gần đây (kiểu NTP). Hạn trong state theo giờ server.

export class ClockSync {
  private samples: { offset: number; rtt: number }[] = []
  /** giờ server − giờ máy (ms) */
  offset = 0

  sample(serverNow: number, sentAt: number, receivedAt: number): void {
    if (!Number.isFinite(serverNow)) return
    const rtt = Math.max(0, receivedAt - sentAt)
    this.samples.push({ offset: serverNow - (sentAt + receivedAt) / 2, rtt })
    if (this.samples.length > 8) this.samples.shift()
    this.offset = this.samples.reduce((a, b) => (b.rtt < a.rtt ? b : a)).offset
  }

  /** giờ server ước tính lúc này */
  serverNow(local = Date.now()): number {
    return local + this.offset
  }

  /** đổi một mốc giờ server sang giờ máy */
  toLocal(serverTime: number): number {
    return serverTime - this.offset
  }
}
