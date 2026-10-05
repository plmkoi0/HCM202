import {
  CircleHelp,
  Dices,
  DoorOpen,
  Flag,
  type LucideIcon,
  Shield,
  Sparkles,
  Star,
  Swords,
  TriangleAlert,
  Repeat,
  ChevronsUp,
  Divide,
  PlusCircle,
  CircleSlash,
  Undo2,
} from 'lucide-react'
import type { PowerupId } from '../engine/types'

/** Biểu tượng loại ô (board.json → cellTypes.icon) */
export const CELL_ICONS: Record<string, LucideIcon> = { gate: DoorOpen, question: CircleHelp, star: Star, trap: TriangleAlert, finish: Flag }

export const POWERUP_ICONS: Record<PowerupId, LucideIcon> = {
  advance3: ChevronsUp,
  extraRoll: PlusCircle,
  fiftyFifty: Divide,
  swap: Repeat,
  shield: Shield,
  double: Dices,
}

export const TRAP_ICONS: Record<string, LucideIcon> = { loseTurn: CircleSlash, back: Undo2 }

export { Sparkles, Swords }

/** Ký hiệu của từng màu ngựa (tokens.json → symbol), vẽ quanh gốc (0,0) cỡ s */
export function SymbolShape({ symbol, s, ...rest }: { symbol: string; s: number } & React.SVGProps<SVGPathElement>) {
  const h = s / 2
  let d: string
  switch (symbol) {
    case 'triangle':
      d = `M0 ${-h} L${h} ${h * 0.8} L${-h} ${h * 0.8} Z`
      break
    case 'square':
      d = `M${-h * 0.85} ${-h * 0.85} H${h * 0.85} V${h * 0.85} H${-h * 0.85} Z`
      break
    case 'diamond':
      d = `M0 ${-h} L${h} 0 L0 ${h} L${-h} 0 Z`
      break
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? h : h * 0.45
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`
      })
      d = `M${pts.join(' L')} Z`
      break
    }
    case 'cross': {
      const w = h * 0.38
      d = `M${-w} ${-h} H${w} V${-w} H${h} V${w} H${w} V${h} H${-w} V${w} H${-h} V${-w} H${-w} Z`
      break
    }
    default:
      d = `M${h} 0 A${h} ${h} 0 1 1 ${-h} 0 A${h} ${h} 0 1 1 ${h} 0 Z`
  }
  return <path d={d} {...rest} />
}

/** Đầu ngựa tự vẽ (hộp 24 × 24) */
export const HORSE_PATH =
  'M7.2 21.5h10.6v-2.3c0-1.9-.9-3.2-2.1-4.5l2.4-1.2 1.5 1.3 1.8-1.5-1.7-3.5C18.9 6.6 16.6 4.4 13.4 3.7L12.3 2 11 3.8C7.6 5 5.7 8 5.7 11.3c0 2.2 1 3.6 2.3 4.8-.6 1-.8 2.2-.8 3.2v2.2z'
