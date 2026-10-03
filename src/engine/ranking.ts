// Xếp hạng (mục 10): người về đích xếp theo thứ tự về đích; người chưa về đích
// xếp theo số ô còn lại tới Đích (ít hơn xếp trên); hòa thì so số câu trả lời đúng;
// vẫn bằng nhau thì cùng hạng.

import { geometry, remainingSteps } from './board'
import type { GameData, GameState, RankEntry } from './types'

export function rank(data: GameData, s: GameState): RankEntry[] {
  const geo = geometry(data, s.config.layout)
  const entries: RankEntry[] = s.players.map((p) => ({
    playerId: p.id,
    rank: 0,
    finished: p.finishRank !== null,
    remaining: p.horses.reduce((sum, h) => sum + remainingSteps(geo, h.step, h.done), 0),
    correct: p.stats.correct,
  }))
  const finishRank = new Map(s.players.map((p) => [p.id, p.finishRank]))
  entries.sort((a, b) => {
    if (a.finished !== b.finished) return a.finished ? -1 : 1
    if (a.finished) return (finishRank.get(a.playerId) ?? 0) - (finishRank.get(b.playerId) ?? 0)
    return a.remaining - b.remaining || b.correct - a.correct
  })
  entries.forEach((e, i) => {
    if (e.finished) {
      e.rank = finishRank.get(e.playerId) ?? i + 1
      return
    }
    const prev = entries[i - 1]
    if (prev && !prev.finished && prev.remaining === e.remaining && prev.correct === e.correct) e.rank = prev.rank
    else e.rank = i + 1
  })
  return entries
}
