// Máy chơi cùng (mục 9): trả lời đúng theo xác suất theo độ khó (bots.json) và
// dùng power-up theo luật đơn giản. Mọi quyết định ngẫu nhiên lấy từ RNG trong
// state nên cùng seed → cùng kết quả.

import { geometry, remainingSteps } from './board'
import { poolKey } from './data'
import { nextFloat, pick } from './rng'
import type { GameData, GameState, PlayerState, PowerupId } from './types'

export type BotDecision =
  | { kind: 'roll' }
  | { kind: 'use'; powerup: PowerupId }
  | { kind: 'choose'; horse: number }
  | { kind: 'answer'; choice: number }
  | { kind: 'discard'; discard: PowerupId | 'new' }
  | { kind: 'next' }

export function botCorrectProbability(data: GameData, difficulty: number, fiftyFifty: boolean): number {
  const p = data.bots.correctByDifficulty[String(difficulty)] ?? 0.5
  return fiftyFifty ? p + (1 - p) / 2 : p
}

export function botAction(data: GameData, s: GameState, p: PlayerState): BotDecision {
  const t = s.turn
  const rules = data.bots.rules
  switch (s.phase) {
    case 'roll': {
      const geo = geometry(data, s.config.layout)
      const remaining = Math.min(...p.horses.filter((h) => !h.done).map((h) => remainingSteps(geo, Math.max(h.step, 0), false)))
      if (p.bag.includes('double') && !t.doubleArmed && remaining >= rules.useDoubleWhenRemainingAtLeast) {
        return { kind: 'use', powerup: 'double' }
      }
      return { kind: 'roll' }
    }
    case 'chooseHorse': {
      // Đi con ngựa xa nhất mà vẫn đi được
      const roll = t.roll!
      let best = -1
      let bestStep = -Infinity
      p.horses.forEach((h, i) => {
        if (h.done) return
        if (h.step < 0 && !data.rules.dice.stableExitFaces.includes(roll.face)) return
        if (h.step > bestStep) {
          best = i
          bestStep = h.step
        }
      })
      return { kind: 'choose', horse: best }
    }
    case 'question': {
      const aq = t.question!
      const q = data.questionById.get(aq.id)!
      const remaining = q.answers.length - aq.eliminated.length
      if (p.bag.includes('fiftyFifty') && !aq.fiftyFiftyUsed && remaining > 2 && aq.difficulty >= rules.useFiftyFiftyMinDifficulty) {
        return { kind: 'use', powerup: 'fiftyFifty' }
      }
      const pool = data.questionPools.get(poolKey(aq.pillar, aq.difficulty)) ?? []
      // Đổi câu sau khi 50:50 đã loại đáp án sẽ mất tác dụng của 50:50 → không đổi nữa
      if (p.bag.includes('swap') && !aq.swapUsed && aq.eliminated.length === 0 && aq.difficulty >= rules.useSwapMinDifficulty && pool.length > 1) {
        return { kind: 'use', powerup: 'swap' }
      }
      const prob = botCorrectProbability(data, aq.difficulty, aq.eliminated.length > 0)
      if (nextFloat(s) < prob) return { kind: 'answer', choice: q.correct }
      const wrong = q.answers.map((_, i) => i).filter((i) => i !== q.correct && !aq.eliminated.includes(i))
      return { kind: 'answer', choice: wrong.length > 0 ? pick(s, wrong) : q.correct }
    }
    case 'discard': {
      const incoming = t.pendingPowerup!
      const prio = (id: PowerupId) => {
        const i = rules.keepPriority.indexOf(id)
        return i < 0 ? rules.keepPriority.length : i
      }
      let worst: PowerupId = incoming
      for (const id of p.bag) if (prio(id) > prio(worst)) worst = id
      return { kind: 'discard', discard: worst === incoming ? 'new' : worst }
    }
    case 'reveal':
      return { kind: 'next' }
    case 'ended':
      return { kind: 'next' }
  }
}
