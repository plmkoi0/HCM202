// Tọa độ SVG của bàn cờ 6 nhánh (mục 4, 12.4): vòng chung là lục giác, mỗi cạnh là một
// nhánh (cổng ở đầu cạnh); đường về đích của màu c là nan hoa từ góc ngay trước cổng c
// vào Đích ở tâm. Lục giác cạnh nằm ngang (nhánh 1 là cạnh dưới) để vừa chiều ngang điện thoại.
// Hệ tọa độ 1000 × 920.

import type { Geometry } from '../engine/board'

export const VIEW_W = 1000
export const VIEW_H = 920
export const CENTER = { x: 500, y: 460 }
const RADIUS = 440

export interface Point {
  x: number
  y: number
}

export interface BoardLayout {
  ring: Point[]
  home: Point[][]
  finish: Point
  stable: Point[]
  corners: Point[]
  ringCellR: number
  homeCellR: number
  finishR: number
}

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

/** Góc lục giác k (0–5): góc 0 dưới-trái, góc 1 dưới-phải → nhánh 1 là cạnh dưới, đi từ trái sang phải */
function corner(k: number): Point {
  const a = ((120 - 60 * k) * Math.PI) / 180
  return { x: CENTER.x + RADIUS * Math.cos(a), y: CENTER.y + RADIUS * Math.sin(a) }
}

const cache = new Map<string, BoardLayout>()

export function boardLayout(geo: Geometry): BoardLayout {
  const key = `${geo.branchCount}-${geo.cellsPerBranch}-${geo.homeLength}`
  const hit = cache.get(key)
  if (hit) return hit
  const B = geo.branchCount
  const C = geo.cellsPerBranch
  const H = geo.homeLength
  const corners = Array.from({ length: B }, (_, k) => corner(k))
  const ring: Point[] = []
  for (let b = 0; b < B; b++) {
    const a = corners[b]
    const z = corners[(b + 1) % B]
    for (let k = 0; k < C; k++) ring.push(lerp(a, z, (k + 0.5) / C))
  }
  // nan hoa của màu c bắt đầu ở góc c (ngay sau ô cuối nhánh c − 1, ngay trước cổng c).
  // t0, t1 chọn để ô về đích không chồng lên ô vòng chung ở góc và không chạm Đích ở tâm.
  const t0 = 0.245
  const t1 = 0.805
  const home = Array.from({ length: B }, (_, c) =>
    Array.from({ length: H }, (_cell, i) => lerp(corners[c], CENTER, H === 1 ? t0 : t0 + ((t1 - t0) * i) / (H - 1))),
  )
  // chuồng: ngoài cổng, lệch ra phía ngoài lục giác
  const stable = Array.from({ length: B }, (_, c) => {
    const g = ring[c * C]
    const dx = g.x - CENTER.x
    const dy = g.y - CENTER.y
    const len = Math.hypot(dx, dy)
    return { x: g.x + (dx / len) * 58, y: g.y + (dy / len) * 58 }
  })
  const sideLen = RADIUS
  const ringCellR = Math.min(56, (sideLen / C) * 0.4)
  const spoke = RADIUS * (t1 - t0)
  const homeCellR = Math.min(36, (H > 1 ? spoke / (H - 1) : 60) * 0.42)
  const layout: BoardLayout = { ring, home, finish: CENTER, stable, corners, ringCellR, homeCellR, finishR: 46 }
  cache.set(key, layout)
  return layout
}

/** Vị trí lệch cho nhiều ngựa trên cùng một ô (không đá ngựa — mục 2) */
export function stackOffset(index: number, count: number, r: number): Point {
  if (count <= 1) return { x: 0, y: 0 }
  const a = (2 * Math.PI * index) / count - Math.PI / 2
  const d = r * 0.42
  return { x: Math.cos(a) * d, y: Math.sin(a) * d }
}
