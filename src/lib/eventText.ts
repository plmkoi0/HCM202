// Chữ nhật ký cho từng sự kiện engine (mẫu trong site.json → events)
import type { GameData, GameEvent, GameState, PowerupId } from '../engine/types'
import { site } from './gameData'
import { fill } from './text'

const HIDDEN = new Set(['moved', 'chooseHorse', 'guessed', 'gameStarted', 'asked'])

export function eventText(data: GameData, s: GameState, e: GameEvent): string | null {
  if (HIDDEN.has(e.type)) return null
  const tpl = (site.events as Record<string, string>)[e.type]
  if (!tpl) return null
  const d = (e.data ?? {}) as Record<string, unknown>
  const name = s.players.find((p) => p.id === e.playerId)?.name ?? ''
  const pu = (id: unknown) => data.powerups.items.find((p) => p.id === (id as PowerupId))?.label ?? String(id)
  const vars: Record<string, string | number> = { name }
  switch (e.type) {
    case 'cannotMove':
      if (d.exact) return fill(site.events.cannotMoveExact, { name })
      break
    case 'rolled':
      if (d.doubled) return fill(site.events.rolledDouble, { name, face: d.face as number, value: d.value as number })
      vars.face = d.face as number
      break
    case 'answeredCorrect':
    case 'advanced':
    case 'movedBack':
      vars.steps = d.steps as number
      break
    case 'powerupGained':
    case 'powerupUsed':
    case 'powerupDiscarded':
      vars.powerup = pu(d.powerup)
      break
    case 'trapDrawn': {
      const c = data.traps.cards.find((x) => x.id === d.card)
      vars.trap = fill(c?.label ?? String(d.card), { n: (d.n as number) ?? 0 })
      break
    }
  }
  return fill(tpl, vars)
}

/** Vài sự kiện gần nhất có chữ (mới nhất trước) */
export function recentLog(data: GameData, s: GameState, n = 6): { seq: number; text: string; playerId?: string }[] {
  const out: { seq: number; text: string; playerId?: string }[] = []
  for (let i = s.log.length - 1; i >= 0 && out.length < n; i--) {
    const e = s.log[i]
    const text = eventText(data, s, e)
    if (text) out.push({ seq: e.seq, text, playerId: e.playerId })
  }
  return out
}
