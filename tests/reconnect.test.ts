// Mạng có lại thì thử WebSocket ngay, không chờ hết khoảng lùi đã tăng trong lúc mất mạng
// (e2e 05/10/2026: máy từng mất mạng còn ở "chế độ dự phòng" khi ván kết thúc).
import { describe, expect, it } from 'vitest'
import { ApiError, type Api } from '../src/net/api'
import { RoomConnection } from '../src/net/connection'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('nối lại WebSocket sau khi mất mạng', () => {
  it('lần poll đầu tiên thành công sau khi mất mạng → mở WebSocket trong ~0,5 s', async () => {
    let offline = true
    const opened: number[] = []
    class FakeWs extends EventTarget {
      readyState = 0
      constructor() {
        super()
        opened.push(Date.now())
        setTimeout(() => {
          if (offline) {
            this.readyState = 3
            this.dispatchEvent(Object.assign(new Event('close'), { code: 1006, reason: '' }))
          } else {
            this.readyState = 1
            this.dispatchEvent(new Event('open'))
          }
        }, 5)
      }
      send() {}
      close() {
        this.readyState = 3
      }
    }
    const api = {
      base: 'http://x',
      clock: { serverNow: () => Date.now(), sample() {} },
      async state() {
        if (offline) throw new ApiError('NETWORK', 0)
        return null
      },
    } as unknown as Api
    const conn = new RoomConnection({
      api,
      session: { code: 'ABCDE', playerId: 'p1', token: 't' },
      onState() {},
      WebSocketImpl: FakeWs as unknown as typeof WebSocket,
      pollMs: 50,
      helloTimeoutMs: 60_000,
      autoTick: false,
    })
    try {
      conn.start()
      // mất mạng ~3,5 s: thử lại WebSocket sau 1 s, 2 s → lần kế tiếp đã lùi tới 5 s
      await sleep(3500)
      expect(conn.mode).toBe('offline')
      const before = opened.length
      offline = false
      const back = Date.now()
      for (let i = 0; i < 40 && opened.length === before; i++) await sleep(25)
      expect(opened.length).toBeGreaterThan(before)
      expect(opened[before]! - back).toBeLessThan(1000)
    } finally {
      conn.stop()
    }
  })
})
