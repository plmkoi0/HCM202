import type { PillarId } from '../types'
import { site } from './site'

export interface Pillar {
  id: PillarId
  /** Nhãn ngắn dùng cho bộ lọc và phiếu */
  label: string
  /** Tên trụ cột theo giáo trình (mục 2) */
  name: string
}

const PILLAR_IDS: PillarId[] = ['dan-chu', 'phap-quyen', 'trong-sach']

// Nhãn và tên trụ cột lấy từ site.json → pillars
export const PILLARS: Pillar[] = PILLAR_IDS.map((id) => ({ id, ...site.pillars[id] }))

export const PILLAR_BY_ID = Object.fromEntries(PILLARS.map((p) => [p.id, p])) as Record<PillarId, Pillar>
