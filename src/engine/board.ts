// Hình học bàn cờ và đường đi riêng của từng màu (mục 4).
// Đường của màu c: Cổng (bước 0) → R − 1 ô vòng chung → rẽ vào đường về đích ở ô
// ngay trước cổng của mình → H ô về đích → Đích (bước R + H).
// Bố cục Ngắn: R = 18, H = 4 → 22 bước; bố cục Dài: R = 24, H = 5 → 29 bước.

import type { CellKind, GameData, LayoutData } from './types'

export interface Geometry {
  layoutId: string
  layout: LayoutData
  branchCount: number
  cellsPerBranch: number
  ringLength: number
  homeLength: number
  finishStep: number
}

export type CellRef =
  | { area: 'stable'; color: number }
  | { area: 'ring'; index: number }
  | { area: 'home'; color: number; index: number }
  | { area: 'finish' }

export interface CellInfo {
  /** 'gate' chỉ khi cổng đó có người chơi; cổng của màu trống là 'question' */
  kind: CellKind | 'finish' | 'stable'
  pillar: string | null
  difficulty: number | null
  ref: CellRef
  /** màu của cổng nếu ô là cổng (dù có người chơi hay không) */
  gateColor: number | null
  branch: number | null
}

const geoCache = new WeakMap<LayoutData, Geometry>()

export function geometry(data: GameData, layoutId: string): Geometry {
  const layout = data.board.layouts[layoutId]
  if (!layout) throw new Error(`Không có bố cục "${layoutId}"`)
  const cached = geoCache.get(layout)
  if (cached) return cached
  const branchCount = layout.branches.length
  const cellsPerBranch = layout.branches[0].length
  for (const b of layout.branches) {
    if (b.length !== cellsPerBranch) throw new Error(`Bố cục ${layoutId}: các nhánh phải cùng số ô`)
    if (b[0] !== 'gate') throw new Error(`Bố cục ${layoutId}: ô đầu mỗi nhánh phải là cổng`)
  }
  const ringLength = branchCount * cellsPerBranch
  const homeLength = layout.homeDifficulties.length
  const geo: Geometry = {
    layoutId,
    layout,
    branchCount,
    cellsPerBranch,
    ringLength,
    homeLength,
    finishStep: ringLength + homeLength,
  }
  geoCache.set(layout, geo)
  return geo
}

/** D1: nhánh i (0-based) → trụ cột thứ (i mod số trụ cột) theo thứ tự mindmap.json */
export function branchPillar(data: GameData, branch: number): string {
  return data.pillars[branch % data.pillars.length].id
}

/** Chỉ số ô vòng chung của cổng màu c (màu c gắn với cổng nhánh c) */
export function gateRingIndex(geo: Geometry, color: number): number {
  return color * geo.cellsPerBranch
}

export function stepToCell(geo: Geometry, color: number, step: number): CellRef {
  if (step < 0) return { area: 'stable', color }
  if (step < geo.ringLength) return { area: 'ring', index: (gateRingIndex(geo, color) + step) % geo.ringLength }
  if (step < geo.finishStep) return { area: 'home', color, index: step - geo.ringLength }
  return { area: 'finish' }
}

export function ringCellInfo(data: GameData, geo: Geometry, activeColors: ReadonlySet<number>, index: number): CellInfo {
  const branch = Math.floor(index / geo.cellsPerBranch)
  const pos = index % geo.cellsPerBranch
  const raw = geo.layout.branches[branch][pos]
  const pillar = branchPillar(data, branch)
  const ref: CellRef = { area: 'ring', index }
  if (raw === 'gate') {
    const gateColor = branch
    if (activeColors.has(gateColor)) {
      return { kind: 'gate', pillar, difficulty: null, ref, gateColor, branch }
    }
    // Cổng của màu không có người chơi thành ô câu hỏi độ khó 1 thuộc trụ cột nhánh (mục 4)
    return { kind: 'question', pillar, difficulty: geo.layout.ringDifficulty, ref, gateColor, branch }
  }
  return {
    kind: raw,
    pillar,
    difficulty: raw === 'question' ? geo.layout.ringDifficulty : null,
    ref,
    gateColor: null,
    branch,
  }
}

/** D3: đường về đích — trụ cột xoay vòng bắt đầu từ trụ cột nhánh có cổng người đó */
export function homeCellPillar(data: GameData, color: number, index: number): string {
  const start = color % data.pillars.length
  return data.pillars[(start + index) % data.pillars.length].id
}

export function cellAtStep(
  data: GameData,
  geo: Geometry,
  activeColors: ReadonlySet<number>,
  color: number,
  step: number,
): CellInfo {
  const ref = stepToCell(geo, color, step)
  switch (ref.area) {
    case 'stable':
      return { kind: 'stable', pillar: null, difficulty: null, ref, gateColor: null, branch: null }
    case 'ring':
      return ringCellInfo(data, geo, activeColors, ref.index)
    case 'home':
      return {
        kind: 'question',
        pillar: homeCellPillar(data, color, ref.index),
        difficulty: geo.layout.homeDifficulties[ref.index],
        ref,
        gateColor: null,
        branch: null,
      }
    case 'finish':
      // trụ cột câu về đích chọn theo seed lúc hỏi (D3)
      return { kind: 'finish', pillar: null, difficulty: geo.layout.finishDifficulty, ref, gateColor: null, branch: null }
  }
}

/** Số bước còn lại tới Đích (ngựa trong chuồng tính từ bước −1) */
export function remainingSteps(geo: Geometry, step: number, done: boolean): number {
  if (done) return 0
  return geo.finishStep - step
}

/**
 * Lùi n bước theo đường của chính người đó (mục 7): có thể từ đường về đích lùi
 * ra vòng chung, không bao giờ lùi quá cổng (bước 0).
 */
export function stepBack(step: number, n: number): number {
  return Math.max(0, step - n)
}
