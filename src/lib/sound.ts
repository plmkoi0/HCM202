// Âm thanh (mục 15.7): Web Audio API (oscillator), không file âm thanh, không request mạng.
// AudioContext chỉ tạo sau thao tác đầu tiên của người dùng (trình duyệt chặn tự phát âm thanh);
// máy không hỗ trợ thì im lặng. Tắt / bật trong Cài đặt hoặc phím M.
import { getSettings } from './settings'

export type SoundName = 'dice' | 'step' | 'correct' | 'wrong' | 'powerup' | 'trap' | 'finish' | 'turn' | 'tap'

type Note = { f: number; at: number; dur: number; type?: OscillatorType; gain?: number; to?: number }

/** Mỗi âm là vài nốt ngắn (tần số Hz, lúc bắt đầu và độ dài theo giây) */
const SOUNDS: Record<SoundName, Note[]> = {
  dice: [0, 0.05, 0.1, 0.15, 0.21, 0.28].map((at, i) => ({ f: 180 + ((i * 97) % 220), at, dur: 0.035, type: 'square', gain: 0.05 })),
  step: [{ f: 620, at: 0, dur: 0.05, type: 'triangle', gain: 0.06 }],
  correct: [
    { f: 523, at: 0, dur: 0.12, type: 'triangle' },
    { f: 659, at: 0.1, dur: 0.12, type: 'triangle' },
    { f: 784, at: 0.2, dur: 0.22, type: 'triangle' },
  ],
  wrong: [
    { f: 330, at: 0, dur: 0.18, type: 'sawtooth', gain: 0.06 },
    { f: 247, at: 0.16, dur: 0.28, type: 'sawtooth', gain: 0.06 },
  ],
  powerup: [
    { f: 660, at: 0, dur: 0.08, type: 'square', gain: 0.05 },
    { f: 880, at: 0.07, dur: 0.08, type: 'square', gain: 0.05 },
    { f: 1175, at: 0.14, dur: 0.16, type: 'square', gain: 0.05 },
  ],
  trap: [{ f: 400, at: 0, dur: 0.4, type: 'sawtooth', gain: 0.06, to: 120 }],
  finish: [
    { f: 523, at: 0, dur: 0.14, type: 'triangle' },
    { f: 659, at: 0.13, dur: 0.14, type: 'triangle' },
    { f: 784, at: 0.26, dur: 0.14, type: 'triangle' },
    { f: 1047, at: 0.39, dur: 0.45, type: 'triangle' },
  ],
  turn: [
    { f: 880, at: 0, dur: 0.1, type: 'sine', gain: 0.1 },
    { f: 1320, at: 0.11, dur: 0.16, type: 'sine', gain: 0.1 },
  ],
  tap: [{ f: 900, at: 0, dur: 0.04, type: 'sine', gain: 0.06 }],
}

let ctx: AudioContext | null = null
let unlocked = false

function context(): AudioContext | null {
  if (ctx) return ctx
  try {
    const C = globalThis.AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    ctx = C ? new C() : null
  } catch {
    ctx = null
  }
  return ctx
}

function wake(): void {
  if (!getSettings().sound) return
  const c = context()
  if (c && c.state === 'suspended') void c.resume().catch(() => {})
}

/** Gọi một lần lúc khởi động: tạo / đánh thức AudioContext ở thao tác đầu tiên */
export function installSoundUnlock(): void {
  if (unlocked || typeof window === 'undefined') return
  unlocked = true
  window.addEventListener('pointerdown', wake, { capture: true, passive: true })
  window.addEventListener('keydown', wake, { capture: true })
}

export function playSound(name: SoundName): void {
  if (!getSettings().sound) return
  const c = context()
  if (!c || c.state !== 'running') {
    if (c && c.state === 'suspended') void c.resume().catch(() => {})
    if (!c || c.state !== 'running') return
  }
  try {
    const t0 = c.currentTime + 0.01
    for (const n of SOUNDS[name]) {
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = n.type ?? 'sine'
      osc.frequency.setValueAtTime(n.f, t0 + n.at)
      if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + n.at + n.dur)
      const peak = n.gain ?? 0.08
      g.gain.setValueAtTime(0.0001, t0 + n.at)
      g.gain.exponentialRampToValueAtTime(peak, t0 + n.at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur)
      osc.connect(g).connect(c.destination)
      osc.start(t0 + n.at)
      osc.stop(t0 + n.at + n.dur + 0.02)
    }
  } catch {
    // bỏ qua: âm thanh không quan trọng bằng ván chơi
  }
}
