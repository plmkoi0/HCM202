// Bảng người chơi (mục 12.4): màu + ký hiệu, số ô còn lại, power-up đang giữ, trạng thái, ai đang tới lượt
import { Bot, CircleSlash, Trophy, WifiOff } from 'lucide-react'
import { playerRemaining } from '../engine/reducer'
import type { GameData, GameState } from '../engine/types'
import { site, tokens } from '../lib/gameData'
import { fill } from '../lib/text'
import { POWERUP_ICONS, SymbolShape } from './icons'
import { powerupLabel } from './TurnPanels'

export function PlayerStrip({ data, state }: { data: GameData; state: GameState }) {
  const t = site.game
  const ordered = state.order.map((id) => state.players.find((p) => p.id === id)!)
  const current = state.phase === 'ended' ? null : state.order[state.turnIndex]
  return (
    // cuộn ngang trên điện thoại → nhận tiêu điểm bàn phím để cuộn được (axe: scrollable-region-focusable)
    <ul className="relative flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label={t.playersLabel} tabIndex={0}>
      {ordered.map((p) => {
        const tok = tokens.colors[p.color]
        const isCur = p.id === current
        const remaining = playerRemaining(data, state, p)
        return (
          <li
            key={p.id}
            className={`flex min-w-[9.5rem] shrink-0 items-center gap-2 rounded-2xl border-2 bg-surface px-2.5 py-1.5 lg:min-w-0 ${isCur ? 'shadow-md' : 'opacity-90'}`}
            style={{ borderColor: isCur ? tok.color : 'var(--line)' }}
            aria-current={isCur ? 'true' : undefined}
          >
            <svg width={30} height={30} viewBox="-15 -15 30 30" aria-hidden="true" className="shrink-0">
              <circle r={14} fill={tok.color} />
              <SymbolShape symbol={tok.symbol} s={14} fill="#fff" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate font-semibold leading-tight">
                <span className="truncate">{p.name}</span>
                {p.isBot && <Bot size={14} aria-label={t.botLabel} />}
                {!p.connected && <WifiOff size={14} aria-label={t.disconnectedLabel} />}
              </p>
              <p className="flex items-center gap-1 text-xs text-ink-soft">
                {p.finishRank !== null ? (
                  <>
                    <Trophy size={12} aria-hidden="true" /> {t.finishedLabel} #{p.finishRank}
                  </>
                ) : (
                  fill(t.remaining, { n: remaining })
                )}
                {p.skipNext && (
                  <span className="flex items-center gap-0.5 text-bad">
                    <CircleSlash size={12} aria-hidden="true" /> {t.skipNext}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-0.5">
              <span className="sr-only">{`${t.bag}: ${p.bag.map((b) => powerupLabel(data, b)).join(', ') || t.bagEmpty}`}</span>
              {p.bag.map((b, i) => {
                const I = POWERUP_ICONS[b]
                return <I key={i} size={16} aria-hidden="true" className="text-ink-soft" />
              })}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
