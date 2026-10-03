import { useEffect, useRef, useState } from 'react'
import type { GameEvent, GameState } from '../engine/types'
import { playSound, type SoundName } from '../lib/sound'

// Diễn hoạt tuần tự theo danh sách sự kiện của state (mục 15.3, 16): xúc xắc lăn, ngựa đi
// từng ô, trượt lùi khi dính bẫy, âm thanh đúng lúc (mục 15.7), pháo giấy khi về đích.
// Giảm hiệu ứng: không chờ giữa các bước, không có tiếng bước đi.

export type Positions = Record<string, number>

export const horseKey = (playerId: string, horse: number) => `${playerId}:${horse}`

export function positionsOf(s: GameState): Positions {
  const out: Positions = {}
  for (const p of s.players) p.horses.forEach((h, i) => (out[horseKey(p.id, i)] = h.step))
  return out
}

type Segment = { kind: 'dice'; face: number; value: number } | { kind: 'move'; key: string; from: number; to: number } | { kind: 'cue'; sound: SoundName }

const MOVE_EVENTS = new Set(['answeredCorrect', 'rested', 'moved', 'advanced', 'movedBack'])

/** sự kiện → âm thanh (phát khi diễn tới sự kiện đó) */
const CUES: Record<string, SoundName> = {
  answeredCorrect: 'correct',
  answeredWrong: 'wrong',
  timedOut: 'wrong',
  powerupGained: 'powerup',
  trapDrawn: 'trap',
  finished: 'finish',
}

export function segmentsOf(events: GameEvent[]): Segment[] {
  const out: Segment[] = []
  for (const e of events) {
    const d = (e.data ?? {}) as Record<string, number>
    const cue = CUES[e.type]
    if (cue) out.push({ kind: 'cue', sound: cue })
    if (e.type === 'rolled') out.push({ kind: 'dice', face: d.face, value: d.value })
    else if (MOVE_EVENTS.has(e.type) && e.playerId && d.from !== d.to && typeof d.to === 'number')
      out.push({ kind: 'move', key: horseKey(e.playerId, d.horse ?? 0), from: d.from, to: d.to })
    else if (e.type === 'leftStable' && e.playerId) out.push({ kind: 'move', key: horseKey(e.playerId, d.horse ?? 0), from: -1, to: 0 })
  }
  return out
}

const DICE_MS = 650
const STEP_MS = 170

export function useBoardAnimation(state: GameState, reduced: boolean) {
  const [positions, setPositions] = useState<Positions>(() => positionsOf(state))
  const [dice, setDice] = useState<{ face: number | null; value: number | null; rolling: boolean }>(() => ({
    face: state.turn.roll?.face ?? null,
    value: state.turn.roll?.value ?? null,
    rolling: false,
  }))
  const [running, setRunning] = useState(false)
  // seq sự kiện đã diễn xong — dùng lúc render để biết còn sự kiện chưa diễn (tránh cửa sổ nháy
  // lên trước khi xúc xắc / ngựa kịp diễn)
  const [shownSeq, setShownSeq] = useState(state.eventSeq)
  // lúc diễn hoạt xong gần nhất — cửa sổ kết quả được hiện đủ thời gian tính từ đây
  const [idleAt, setIdleAt] = useState(0)
  // tăng mỗi lần có người về đích → pháo giấy
  const [burst, setBurst] = useState(0)
  const seqRef = useRef(state.eventSeq)
  const queue = useRef<Segment[]>([])
  const runningRef = useRef(false)
  const pos = useRef<Positions>(positions)
  const latest = useRef(state)
  const alive = useRef(true)
  const reducedRef = useRef(reduced)
  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    latest.current = state
    if (state.eventSeq < seqRef.current) {
      // hoàn tác / ván mới: hiện ngay trạng thái mới
      queue.current = []
      seqRef.current = state.eventSeq
      pos.current = positionsOf(state)
      setPositions(pos.current)
      setDice({ face: state.turn.roll?.face ?? null, value: state.turn.roll?.value ?? null, rolling: false })
      setShownSeq(state.eventSeq)
      return
    }
    const fresh = state.log.filter((e) => e.seq > seqRef.current)
    seqRef.current = state.eventSeq
    queue.current.push(...segmentsOf(fresh))
    if (runningRef.current) return
    runningRef.current = true
    setRunning(true)
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, reducedRef.current ? 0 : ms))
    void (async () => {
      while (alive.current && queue.current.length > 0) {
        const seg = queue.current.shift()!
        if (seg.kind === 'cue') {
          playSound(seg.sound)
          if (seg.sound === 'finish') setBurst((b) => b + 1)
        } else if (seg.kind === 'dice') {
          playSound('dice')
          setDice((d) => ({ ...d, rolling: !reducedRef.current }))
          await sleep(DICE_MS)
          setDice({ face: seg.face, value: seg.value, rolling: false })
          await sleep(200)
        } else {
          const dir = seg.to > seg.from ? 1 : -1
          if (reducedRef.current) {
            pos.current = { ...pos.current, [seg.key]: seg.to }
            setPositions(pos.current)
            continue
          }
          for (let st = seg.from + dir; dir > 0 ? st <= seg.to : st >= seg.to; st += dir) {
            pos.current = { ...pos.current, [seg.key]: st }
            setPositions(pos.current)
            playSound('step')
            await sleep(STEP_MS)
          }
        }
      }
      if (!alive.current) return
      // khớp lại với state thật (phòng khi bỏ sót sự kiện)
      pos.current = positionsOf(latest.current)
      setPositions(pos.current)
      runningRef.current = false
      setRunning(false)
      setShownSeq(seqRef.current)
      setIdleAt(Date.now())
    })()
  }, [state])

  const busy = running || shownSeq < state.eventSeq
  return { positions, dice, busy, idleAt, burst }
}
