// Mô phỏng cân bằng (mục 11, 17): N ván toàn bot cho 1, 2, 3, 5 người ở cả hai bố cục,
// với 20 s và 25 s mỗi lượt. Bot trả lời đúng theo xác suất trong bots.json
// (dùng làm đại diện cho người chơi) và dùng power-up theo luật đơn giản.
//
// Mô hình thời gian (giả định, ghi ở mục 11):
//   - mỗi lần tung dẫn tới câu hỏi: T giây (tung + đọc + trả lời + xem đáp án đúng)
//   - mỗi lần tung không dẫn tới câu hỏi (cổng, power-up, bẫy, không đi được): T/2 giây
//   - lượt bị bỏ (thẻ "mất lượt"): 2 giây
//
// Dùng: npm run simulate -- [--games 1000] [--json out.json]

import { writeFileSync } from 'node:fs'
import { applyAction, createGame, pendingAutoAction } from '../src/engine/reducer'
import { rank } from '../src/engine/ranking'
import type { GameData, GameState } from '../src/engine/types'
import { gameData } from '../src/lib/gameData'

interface Config {
  players: number
  layout: 'ngan' | 'dai'
  turnSeconds: number
}

interface GameResult {
  firstFinishSec: number
  winnerTurns: number
  turnsPerPlayer: number
  traps: number[]
  maxStall: number
  secondsPerTurn: number
  /** ảnh chụp xếp hạng khi hết giờ ở mốc 5 / 7 / 10 phút; null nếu ván kết thúc do có người
   *  về đích (kể cả về đích trong lượt đang dở lúc hết giờ — mục 10 "chơi nốt lượt") */
  atLimit: Record<number, { leaderTied: boolean; gap: number; leaderRemaining: number } | null>
}

const LIMITS = [5, 7, 10]

function playOne(data: GameData, cfg: Config, seed: number): GameResult {
  let s: GameState = createGame(data, {
    players: Array.from({ length: cfg.players }, (_, i) => ({ id: `b${i}`, name: `Bot ${i}`, color: i, isBot: true })),
    config: { layout: cfg.layout, timeLimitMin: null, afterFirstFinish: 'stop' },
    seed,
    now: 0,
  })
  let elapsed = 0
  let turns = 1
  const atLimit: GameResult['atLimit'] = {}
  const snapshot = () => {
    for (const L of LIMITS) {
      if (atLimit[L] !== undefined || elapsed < L * 60) continue
      const r = rank(data, s)
      atLimit[L] = {
        leaderTied: r.length > 1 && r[1].rank === r[0].rank,
        gap: r.length > 1 ? r[1].remaining - r[0].remaining : 0,
        leaderRemaining: r[0].remaining,
      }
    }
  }
  for (let guard = 0; guard < 100000 && s.phase !== 'ended'; guard++) {
    const a = pendingAutoAction(s, s.deadline!)
    if (!a) throw new Error('mô phỏng: không có hành động')
    const res = applyAction(data, s, a)
    if (!res.ok) throw new Error(`mô phỏng: ${res.error}`)
    s = res.state
    for (const e of s.events) {
      if (e.type === 'rolled') elapsed += cfg.turnSeconds / 2
      else if (e.type === 'asked') elapsed += cfg.turnSeconds / 2
      else if (e.type === 'turnSkipped') elapsed += 2
      if (e.type === 'turnStarted' || e.type === 'turnSkipped') {
        snapshot()
        turns += 1
      }
    }
  }
  if (s.phase !== 'ended') throw new Error('mô phỏng: ván không kết thúc')
  for (const L of LIMITS) if (atLimit[L] === undefined) atLimit[L] = null
  const winner = s.players.find((p) => p.finishRank === 1)!
  return {
    firstFinishSec: elapsed,
    winnerTurns: winner.stats.turns,
    turnsPerPlayer: turns / cfg.players,
    traps: s.players.map((p) => p.stats.trapsHit),
    maxStall: Math.max(...s.players.map((p) => p.stats.maxStall)),
    secondsPerTurn: elapsed / s.players.reduce((n, p) => n + p.stats.turns, 0),
    atLimit,
  }
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const quantile = (xs: number[], q: number) => {
  const a = xs.slice().sort((x, y) => x - y)
  return a[Math.min(a.length - 1, Math.floor(q * a.length))]
}
const pct = (x: number) => `${Math.round(x * 100)}%`
const num = (x: number, d = 1) => x.toFixed(d).replace('.', ',')

export function simulate(data: GameData, cfg: Config, games: number) {
  const rs = Array.from({ length: games }, (_, i) => playOne(data, cfg, 1000 + i))
  const min = rs.map((r) => r.firstFinishSec / 60)
  const byLimit = Object.fromEntries(
    LIMITS.map((L) => {
      const ended = rs.filter((r) => r.atLimit[L] !== null)
      return [
        L,
        {
          // có người về đích khi chơi với giới hạn L phút (gồm về đích trong lượt đang dở lúc hết giờ)
          finishedWithin: rs.filter((r) => r.atLimit[L] === null).length / games,
          endedByTime: ended.length / games,
          leaderTied: ended.length ? ended.filter((r) => r.atLimit[L]!.leaderTied).length / ended.length : 0,
          meanGap: ended.length ? mean(ended.map((r) => r.atLimit[L]!.gap)) : 0,
        },
      ]
    }),
  ) as Record<number, { finishedWithin: number; endedByTime: number; leaderTied: number; meanGap: number }>
  return {
    ...cfg,
    games,
    winnerTurns: mean(rs.map((r) => r.winnerTurns)),
    minutesMean: mean(min),
    minutesMedian: quantile(min, 0.5),
    minutesP90: quantile(min, 0.9),
    secondsPerTurn: mean(rs.map((r) => r.secondsPerTurn)),
    trapsPerPlayer: mean(rs.flatMap((r) => r.traps)),
    maxStallMean: mean(rs.map((r) => r.maxStall)),
    maxStallP95: quantile(rs.map((r) => r.maxStall), 0.95),
    maxStallMax: Math.max(...rs.map((r) => r.maxStall)),
    byLimit,
  }
}

function main() {
  const args = process.argv.slice(2)
  const games = Number(args[args.indexOf('--games') + 1]) || 1000
  const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null
  const results = []
  for (const layout of ['ngan', 'dai'] as const)
    for (const turnSeconds of [20, 25])
      for (const players of [1, 2, 3, 5]) results.push(simulate(gameData, { players, layout, turnSeconds }, games))

  const lines: string[] = []
  lines.push(`Mô phỏng ${games} ván mỗi cấu hình — bot đúng ${Object.values(gameData.bots.correctByDifficulty).map((p) => pct(p)).join(' / ')} theo độ khó 1 / 2 / 3.`)
  lines.push('')
  lines.push('| Bố cục | s/lượt | Người | Lượt của người về đích đầu tiên (TB) | Phút tới người đầu về đích (TB · trung vị · P90) | Ván có người về đích với giới hạn 5 / 7 / 10 phút | Dính bẫy TB / người | Chuỗi đứng yên dài nhất trong ván (TB · P95 · max) |')
  lines.push('|---|---|---|---|---|---|---|---|')
  for (const r of results) {
    lines.push(
      `| ${r.layout === 'ngan' ? 'Ngắn' : 'Dài'} | ${r.turnSeconds} | ${r.players} | ${num(r.winnerTurns)} | ${num(r.minutesMean)} · ${num(r.minutesMedian)} · ${num(r.minutesP90)} | ${LIMITS.map((L) => pct(r.byLimit[L].finishedWithin)).join(' / ')} | ${num(r.trapsPerPlayer, 2)} | ${num(r.maxStallMean)} · ${r.maxStallP95} · ${r.maxStallMax} |`,
    )
  }
  lines.push('')
  lines.push('Kết thúc theo giờ (bố cục Ngắn): tỉ lệ ván hết giờ mà chưa ai về đích (bù đúng với cột "có người về đích" ở trên); trong các ván đó, tỉ lệ hai người đầu bằng hạng (không phân định được người dẫn đầu) và khoảng cách TB giữa người thứ nhất và thứ hai (số ô).')
  lines.push('')
  lines.push('| s/lượt | Người | 5 phút: hết giờ · đồng hạng đầu · cách biệt | 7 phút | 10 phút |')
  lines.push('|---|---|---|---|---|')
  for (const r of results.filter((x) => x.layout === 'ngan' && x.players > 1)) {
    lines.push(
      `| ${r.turnSeconds} | ${r.players} | ${LIMITS.map((L) => `${pct(r.byLimit[L].endedByTime)} · ${pct(r.byLimit[L].leaderTied)} · ${num(r.byLimit[L].meanGap)}`).join(' | ')} |`,
    )
  }
  lines.push('')
  lines.push(`Thời gian TB mỗi lượt theo mô hình: ${results.filter((r) => r.layout === 'ngan').map((r) => `${r.turnSeconds} s/${r.players} người → ${num(r.secondsPerTurn)} s`).join('; ')}.`)
  console.log(lines.join('\n'))
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(results, null, 2))
}

const isMain = process.argv[1]?.endsWith('simulate.ts')
if (isMain) main()
