// Cửa sổ kết quả bước đi không có câu hỏi (ô nghỉ, power-up, thẻ bẫy, không đi được),
// túi đầy và chọn ngựa (mục 6, 7, 12.5). Nhãn bẫy trung tính (N4).
import { geometry } from '../engine/board'
import type { GameData, GameState, PowerupId } from '../engine/types'
import { site } from '../lib/gameData'
import { fill } from '../lib/text'
import { Countdown } from './Countdown'
import { POWERUP_ICONS, TRAP_ICONS } from './icons'
import { Sheet } from './Sheet'

export function powerupLabel(data: GameData, id: PowerupId): string {
  return data.powerups.items.find((p) => p.id === id)?.label ?? id
}

export function trapLabel(data: GameData, cardId: string, n?: number): string {
  const c = data.traps.cards.find((x) => x.id === cardId)
  return fill(c?.label ?? cardId, { n: n ?? 0 })
}

export function OutcomePanel({
  data,
  state,
  playerName,
  onContinue,
  canContinue,
  autoAt,
}: {
  data: GameData
  state: GameState
  playerName: string
  onContinue: () => void
  canContinue: boolean
  /** lúc tự sang lượt (hiện đồng hồ) */
  autoAt: number | null
}) {
  const o = state.turn.outcome
  const t = site.game.outcome
  if (!o || o.kind === 'answered') return null
  let title = ''
  let body: string[] = []
  let Icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }> | null = null
  switch (o.kind) {
    case 'rest':
      title = t.rest
      break
    case 'blocked':
      title = state.config.exactFinish ? t.blockedExact : t.blocked
      break
    case 'stable':
      title = o.left ? t.stableLeft : t.stableStay
      break
    case 'powerup': {
      const item = data.powerups.items.find((p) => p.id === o.powerup)!
      Icon = POWERUP_ICONS[o.powerup]
      title = `${t.powerup}: ${item.label}`
      if (o.powerup === 'advance3') body = [(o.extra ?? 0) > 0 ? fill(t.advance, { n: o.extra ?? 0 }) : t.advanceNone]
      else if (o.powerup === 'extraRoll') body = [t.extraRoll]
      else body = [item.effect, o.kept ? t.kept : t.dropped]
      break
    }
    case 'trap': {
      const card = data.traps.cards.find((c) => c.id === o.card)!
      Icon = TRAP_ICONS[card.kind]
      // Khiên chặn thẻ lùi: vẫn rút số ô (drawn) để nhãn thẻ đầy đủ
      title = `${t.trap}: ${trapLabel(data, o.card, o.blocked ? o.drawn : o.back)}`
      if (o.blocked) body = [t.shield]
      else if (card.kind === 'loseTurn') body = [t.loseTurn]
      else body = [o.back ? fill(t.back, { n: o.back }) : t.backNone]
      break
    }
  }
  const tone = o.kind === 'trap' && !o.blocked ? 'bad' : o.kind === 'powerup' ? 'good' : 'default'
  return (
    <Sheet labelledBy="outcome-title" tone={tone}>
      <div className="flex flex-col gap-3" aria-live="polite">
        <p className="text-sm font-semibold text-ink-soft">{playerName}</p>
        <h2 id="outcome-title" className="flex items-center gap-2 font-serif text-xl font-bold">
          {Icon && <Icon size={28} aria-hidden={true} />}
          {title}
        </h2>
        {body.map((b) => (
          <p key={b}>{b}</p>
        ))}
        <Countdown deadline={autoAt} total={state.config.timers.noticeMs} label={(s) => fill(site.game.autoContinueIn, { s })} />
        {canContinue && (
          <button type="button" className="btn-primary" data-autofocus onClick={onContinue}>
            {site.game.continue}
          </button>
        )}
      </div>
    </Sheet>
  )
}

export function DiscardPanel({ data, bag, incoming, onDiscard }: { data: GameData; bag: PowerupId[]; incoming: PowerupId; onDiscard: (id: PowerupId | 'new') => void }) {
  const t = site.game.discard
  return (
    <Sheet title={t.title} labelledBy="discard-title">
      <div className="flex flex-col gap-3">
        <p>{fill(t.body, { n: data.powerups.bagSize })}</p>
        {bag.map((id, i) => {
          const I = POWERUP_ICONS[id]
          return (
            <button key={`${id}-${i}`} type="button" className="btn-secondary justify-start" onClick={() => onDiscard(id)}>
              <I size={20} aria-hidden="true" /> {fill(t.drop, { item: powerupLabel(data, id) })}
            </button>
          )
        })}
        <button type="button" className="btn-primary" onClick={() => onDiscard('new')}>
          {t.dropNew}: {powerupLabel(data, incoming)}
        </button>
      </div>
    </Sheet>
  )
}

/**
 * Chọn ngựa (2 ngựa): hiện ngay trong khu điều khiển, không che bàn cờ — bấm nút ở đây hoặc
 * bấm ngựa có viền vàng trên bàn cờ.
 */
export function ChooseHorsePanel({ data, state, movable, onChoose }: { data: GameData; state: GameState; movable: number[]; onChoose: (h: number) => void }) {
  const geo = geometry(data, state.config.layout)
  const p = state.players.find((x) => x.id === state.turn.playerId)!
  const roll = state.turn.roll!
  const t = site.game
  return (
    <div className="flex flex-col gap-2" role="group" aria-labelledby="choose-title">
      <h3 id="choose-title" className="font-bold">
        {t.chooseHorse}
      </h3>
      <p className="text-sm text-ink-soft">{t.chooseHorseHint}</p>
      {movable.map((h, i) => {
        const from = p.horses[h].step
        const to = from < 0 ? 0 : Math.min(from + roll.value, geo.finishStep)
        return (
          <button key={h} type="button" className="btn-secondary justify-start" onClick={() => onChoose(h)} data-autofocus={i === 0 ? true : undefined}>
            {fill(t.horseN, { n: h + 1 })}: {from < 0 ? t.inStable : fill(t.horseMove, { from, to })}
          </button>
        )
      })}
    </div>
  )
}
