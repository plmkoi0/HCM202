// Bàn cờ 6 nhánh vẽ bằng SVG (mục 12.4, 15.2): mỗi loại ô có biểu tượng + màu; ô câu hỏi
// đồng nhất (bản 1.6: không trụ cột, không độ khó); ngựa có cả màu lẫn ký hiệu.

import { memo } from 'react'
import { geometry, ringCellInfo, stepToCell, type CellInfo } from '../engine/board'
import type { GameData, GameState } from '../engine/types'
import { horseKey, type Positions } from '../game/useBoardAnimation'
import { boardLayout, CENTER, stackOffset, VIEW_H, VIEW_W, type BoardLayout, type Point } from '../lib/boardLayout'
import { site, tokens } from '../lib/gameData'
import { fill } from '../lib/text'
import { CELL_ICONS, HORSE_PATH, SymbolShape } from './icons'

export const POWERUP_FILL = '#F2C14E'
export const TRAP_FILL = '#2E2A26'
export const TRAP_ICON = '#FFB238'
/** viền + biểu tượng ô câu hỏi (một màu cho mọi ô câu hỏi) */
export const QUESTION_STROKE = '#5B5246'

interface Props {
  data: GameData
  state: GameState
  positions: Positions
  /** ô đích của bước đi đang làm nổi */
  target: { color: number; step: number } | null
  currentPlayerId: string | null
  /** chọn ngựa (2 ngựa): danh sách ngựa bấm được */
  selectable?: number[]
  onSelectHorse?: (horse: number) => void
  reduced: boolean
  labels: { board: string; cell: Record<string, string>; finish: string; horseN: string }
}

function pointOf(layout: BoardLayout, geoStep: ReturnType<typeof stepToCell>): Point {
  switch (geoStep.area) {
    case 'ring':
      return layout.ring[geoStep.index]
    case 'home':
      return layout.home[geoStep.color][geoStep.index]
    case 'finish':
      return layout.finish
    case 'stable':
      return layout.stable[geoStep.color]
  }
}

function Icon({ name, x, y, size, color }: { name: string; x: number; y: number; size: number; color: string }) {
  const C = CELL_ICONS[name]
  if (!C) return null
  return <C x={x - size / 2} y={y - size / 2} width={size} height={size} color={color} strokeWidth={2.4} aria-hidden="true" />
}

function CellShape({
  info,
  at,
  r,
  dim,
  homeColor,
  labels,
}: {
  info: CellInfo
  at: Point
  r: number
  dim: boolean
  homeColor?: string
  labels: Props['labels']
}) {
  const opacity = dim ? 0.45 : 1
  const title = labels.cell[info.kind] ?? ''
  if (info.kind === 'gate') {
    const c = tokens.colors[info.gateColor!].color
    return (
      <g opacity={opacity}>
        <title>{title}</title>
        <circle cx={at.x} cy={at.y} r={r} fill={c} stroke="var(--ink)" strokeWidth={3} />
        <Icon name="gate" x={at.x} y={at.y} size={r * 1.05} color="#fff" />
      </g>
    )
  }
  if (info.kind === 'powerup' || info.kind === 'trap') {
    const isPu = info.kind === 'powerup'
    return (
      <g opacity={opacity}>
        <title>{title}</title>
        <circle cx={at.x} cy={at.y} r={r} fill={isPu ? POWERUP_FILL : TRAP_FILL} stroke="var(--ink)" strokeWidth={3} />
        <Icon name={isPu ? 'star' : 'trap'} x={at.x} y={at.y} size={r * 1.1} color={isPu ? '#5A3B00' : TRAP_ICON} />
      </g>
    )
  }
  // ô câu hỏi (vòng chung, cổng màu trống, đường về đích) — đồng nhất, câu rút ngẫu nhiên (mục 5)
  return (
    <g opacity={opacity}>
      <title>{title}</title>
      <circle
        cx={at.x}
        cy={at.y}
        r={r}
        style={{ fill: homeColor ? `color-mix(in srgb, ${homeColor} 20%, var(--surface))` : 'var(--surface)' }}
        stroke={QUESTION_STROKE}
        strokeWidth={Math.max(3, r * 0.1)}
      />
      {info.gateColor !== null && (
        <circle cx={at.x} cy={at.y} r={r * 0.86} fill="none" stroke={tokens.colors[info.gateColor].color} strokeWidth={2.5} strokeDasharray="6 5" opacity={0.7} />
      )}
      <Icon name="question" x={at.x} y={at.y} size={r * 1.05} color={QUESTION_STROKE} />
    </g>
  )
}

function HorseToken({
  at,
  r,
  color,
  symbol,
  isBot,
  current,
  selectable,
  onSelect,
  label,
  number,
}: {
  at: Point
  r: number
  color: { color: string; dark: string }
  symbol: string
  isBot: boolean
  current: boolean
  selectable: boolean
  onSelect?: () => void
  label: string
  /** số ngựa (chỉ hiện khi mỗi người có 2 ngựa) */
  number?: number
}) {
  const s = (r * 2) / 24
  return (
    <g
      transform={`translate(${at.x} ${at.y})`}
      style={{ transition: 'transform 150ms ease-out', cursor: selectable ? 'pointer' : undefined }}
      role={selectable ? 'button' : 'img'}
      aria-label={label}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? onSelect : undefined}
      onKeyDown={selectable ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.() : undefined}
    >
      {(current || selectable) && <circle r={r * 1.28} fill="none" stroke={selectable ? 'var(--gold)' : color.color} strokeWidth={selectable ? 7 : 4} opacity={0.9} />}
      <circle r={r} fill={color.color} stroke="#fff" strokeWidth={4} />
      <g transform={`translate(${-r * 0.82} ${-r * 0.92}) scale(${s * 0.82})`}>
        <path d={HORSE_PATH} fill="#fff" stroke={color.dark} strokeWidth={1.1} strokeLinejoin="round" />
        <circle cx={12.6} cy={7.6} r={1} fill={color.dark} />
      </g>
      <g transform={`translate(${r * 0.72} ${-r * 0.72})`}>
        <circle r={r * 0.46} fill="#fff" stroke={color.dark} strokeWidth={2} />
        <SymbolShape symbol={symbol} s={r * 0.56} fill={color.dark} />
      </g>
      {number !== undefined && (
        <g transform={`translate(${-r * 0.74} ${r * 0.74})`}>
          <circle r={r * 0.42} fill="#fff" stroke={color.dark} strokeWidth={2} />
          <text y={r * 0.17} fontSize={r * 0.5} fontWeight={800} fill={color.dark} textAnchor="middle">
            {number}
          </text>
        </g>
      )}
      {isBot && (
        <g transform={`translate(${r * 0.74} ${r * 0.74})`}>
          <circle r={r * 0.42} fill="var(--ink)" />
          <text y={r * 0.17} fontSize={r * 0.5} fontWeight={700} fill="var(--bg)" textAnchor="middle">
            {tokens.botMark}
          </text>
        </g>
      )}
    </g>
  )
}

export const Board = memo(function Board({ data, state, positions, target, currentPlayerId, selectable, onSelectHorse, reduced, labels }: Props) {
  const geo = geometry(data, state.config.layout)
  const layout = boardLayout(geo)
  const active = new Set(state.players.map((p) => p.color))

  // gom ngựa theo ô để xếp lệch khi đứng chung
  const byCell = new Map<string, { pid: string; horse: number }[]>()
  for (const p of state.players) {
    p.horses.forEach((h, i) => {
      const step = h.done ? geo.finishStep : (positions[horseKey(p.id, i)] ?? h.step)
      const ref = stepToCell(geo, p.color, step)
      const key = ref.area === 'ring' ? `r${ref.index}` : ref.area === 'home' ? `h${ref.color}-${ref.index}` : ref.area === 'finish' ? 'f' : `s${ref.color}`
      const list = byCell.get(key) ?? []
      list.push({ pid: p.id, horse: i })
      byCell.set(key, list)
    })
  }

  let targetPoint: Point | null = null
  let targetR = layout.ringCellR
  if (target) {
    const ref = stepToCell(geo, target.color, target.step)
    targetPoint = pointOf(layout, ref)
    targetR = ref.area === 'home' ? layout.homeCellR : ref.area === 'finish' ? layout.finishR : layout.ringCellR
  }

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full select-none" role="group" aria-label={labels.board}>
      {/* nền lục giác */}
      <polygon points={layout.corners.map((c) => `${c.x},${c.y}`).join(' ')} fill="var(--surface)" stroke="var(--line)" strokeWidth={6} strokeLinejoin="round" />
      {/* dải đường vòng chung */}
      {layout.corners.map((a, b) => {
        const z = layout.corners[(b + 1) % layout.corners.length]
        return <line key={`band${b}`} x1={a.x} y1={a.y} x2={z.x} y2={z.y} stroke="var(--line)" strokeOpacity={0.7} strokeWidth={layout.ringCellR * 2.6} strokeLinecap="round" />
      })}
      {/* nan hoa đường về đích */}
      {layout.corners.map((cn, c) => (
        <line
          key={`spoke${c}`}
          x1={cn.x}
          y1={cn.y}
          x2={CENTER.x}
          y2={CENTER.y}
          stroke={active.has(c) ? tokens.colors[c].color : 'var(--line)'}
          strokeOpacity={active.has(c) ? 0.35 : 0.35}
          strokeWidth={layout.homeCellR * 2.3}
          strokeLinecap="round"
        />
      ))}
      {/* ô vòng chung */}
      {layout.ring.map((pt, i) => (
        <CellShape key={`ring${i}`} info={ringCellInfo(geo, active, i)} at={pt} r={layout.ringCellR} dim={false} labels={labels} />
      ))}
      {/* ô đường về đích */}
      {layout.home.map((cells, c) =>
        cells.map((pt, i) => (
          <CellShape
            key={`home${c}-${i}`}
            info={{ kind: 'question', ref: { area: 'home', color: c, index: i }, gateColor: null, branch: null }}
            at={pt}
            r={layout.homeCellR}
            dim={!active.has(c)}
            homeColor={tokens.colors[c].color}
            labels={labels}
          />
        )),
      )}
      {/* Đích */}
      <g>
        <title>{labels.finish}</title>
        <circle cx={CENTER.x} cy={CENTER.y} r={layout.finishR} fill={POWERUP_FILL} stroke="var(--ink)" strokeWidth={4} />
        <Icon name="finish" x={CENTER.x} y={CENTER.y} size={layout.finishR * 1.05} color="#5A3B00" />
      </g>
      {/* ô đích của bước đi */}
      {targetPoint && (
        <circle cx={targetPoint.x} cy={targetPoint.y} r={targetR + 10} fill="none" stroke="var(--gold)" strokeWidth={8} className={reduced ? undefined : 'target-pulse'} />
      )}
      {/* ngựa */}
      {[...byCell.entries()].flatMap(([key, list]) =>
        list.map((it, idx) => {
          const p = state.players.find((pl) => pl.id === it.pid)!
          const h = p.horses[it.horse]
          const step = h.done ? geo.finishStep : (positions[horseKey(p.id, it.horse)] ?? h.step)
          const ref = stepToCell(geo, p.color, step)
          const base = pointOf(layout, ref)
          const cellR = ref.area === 'home' ? layout.homeCellR : ref.area === 'finish' ? layout.finishR : ref.area === 'stable' ? 26 : layout.ringCellR
          const off = stackOffset(idx, list.length, cellR * 1.6)
          const r = Math.max(15, Math.min(cellR, layout.ringCellR) * (list.length > 1 ? 0.55 : 0.68))
          const tok = tokens.colors[p.color]
          const isSel = !!selectable && p.id === currentPlayerId && selectable.includes(it.horse)
          return (
            <HorseToken
              key={`${key}-${p.id}-${it.horse}`}
              at={{ x: base.x + off.x, y: base.y + off.y }}
              r={r}
              color={tok}
              symbol={tok.symbol}
              isBot={p.isBot}
              current={p.id === currentPlayerId}
              selectable={isSel}
              onSelect={() => onSelectHorse?.(it.horse)}
              label={`${p.name} — ${tok.name} (${tok.symbolLabel})${p.horses.length > 1 ? ` · ${fill(labels.horseN, { n: it.horse + 1 })}` : ''}`}
              number={p.horses.length > 1 ? it.horse + 1 : undefined}
            />
          )
        }),
      )}
    </svg>
  )
})


export function Swatch({ bg, stroke, icon, iconColor, strokeWidth = 3 }: { bg: string; stroke: string; icon: string; iconColor: string; strokeWidth?: number }) {
  return (
    <svg width={30} height={30} viewBox="-15 -15 30 30" aria-hidden="true" className="shrink-0">
      <circle r={12.5} style={{ fill: bg }} stroke={stroke} strokeWidth={strokeWidth} />
      <Icon name={icon} x={0} y={0} size={14} color={iconColor} />
    </svg>
  )
}

/** Các loại ô kèm hình mẫu (chú thích bàn cờ, Luật chơi) */
export function cellLegendItems(data: GameData): { key: string; swatch: React.ReactNode; label: string; text?: string }[] {
  const ct = data.board.cellTypes
  return [
    { key: 'gate', swatch: <Swatch bg={tokens.colors[0].color} stroke="var(--ink)" icon="gate" iconColor="#fff" />, label: ct.gate?.label ?? '', text: ct.gate?.description },
    {
      key: 'question',
      swatch: <Swatch bg="var(--surface)" stroke={QUESTION_STROKE} icon="question" iconColor={QUESTION_STROKE} strokeWidth={2.5} />,
      label: ct.question?.label ?? '',
      text: ct.question?.description,
    },
    { key: 'powerup', swatch: <Swatch bg={POWERUP_FILL} stroke="var(--ink)" icon="star" iconColor="#5A3B00" />, label: ct.powerup?.label ?? '', text: ct.powerup?.description },
    { key: 'trap', swatch: <Swatch bg={TRAP_FILL} stroke="var(--ink)" icon="trap" iconColor={TRAP_ICON} />, label: ct.trap?.label ?? '', text: ct.trap?.description },
    {
      key: 'home',
      swatch: <Swatch bg={`color-mix(in srgb, ${tokens.colors[0].color} 20%, var(--surface))`} stroke={QUESTION_STROKE} icon="question" iconColor={QUESTION_STROKE} strokeWidth={2.5} />,
      label: ct.home?.label ?? '',
      text: ct.home?.description,
    },
    { key: 'finish', swatch: <Swatch bg={POWERUP_FILL} stroke="var(--ink)" icon="finish" iconColor="#5A3B00" />, label: ct.finish?.label ?? '', text: ct.finish?.description },
  ]
}

/** Chú thích bàn cờ (mục 12.4): loại ô, màu + chữ viết tắt trụ cột, ô đích của bước đi */
export function BoardLegend({ data }: { data: GameData }) {
  const t = site.board
  const items = cellLegendItems(data)
  return (
    <details className="card board-light text-sm">
      <summary className="cursor-pointer font-bold">{t.legend}</summary>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((it) => (
          <li key={it.key} className="flex items-start gap-2">
            {it.swatch}
            <span>
              <span className="font-semibold">{it.label}</span>
              {it.text ? ` — ${it.text}` : ''}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2">
          <svg width={30} height={30} viewBox="-15 -15 30 30" aria-hidden="true" className="shrink-0">
            <circle r={11} fill="none" stroke="var(--gold)" strokeWidth={4} />
          </svg>
          <span className="font-semibold">{t.target}</span>
        </li>
      </ul>
    </details>
  )
}
