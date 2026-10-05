// Chip màu + ký hiệu ngựa + chữ (vd. "Câu hỏi của Minh") — cửa sổ câu hỏi / kết quả nói rõ là của ai (05/10/2026)
import type { PlayerState } from '../engine/types'
import { tokens } from '../lib/gameData'
import { SymbolShape } from './icons'

export function PlayerChip({ player, text }: { player: PlayerState; text: string }) {
  const tok = tokens.colors[player.color]
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border-2 bg-surface py-0.5 pl-0.5 pr-3 font-semibold" style={{ borderColor: tok.color }} data-player-chip>
      <svg width={24} height={24} viewBox="-15 -15 30 30" aria-hidden="true" className="shrink-0">
        <circle r={14} fill={tok.color} />
        <SymbolShape symbol={tok.symbol} s={14} fill="#fff" />
      </svg>
      <span className="truncate">{text}</span>
    </span>
  )
}
