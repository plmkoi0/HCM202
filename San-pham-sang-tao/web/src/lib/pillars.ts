import type { PillarId } from '../types'

export interface Pillar {
  id: PillarId
  /** Nhãn ngắn dùng cho bộ lọc và phiếu */
  label: string
  /** Tên trụ cột theo giáo trình (mục 2) */
  name: string
}

export const PILLARS: Pillar[] = [
  { id: 'dan-chu', label: 'Dân chủ', name: 'Nhà nước dân chủ' },
  { id: 'phap-quyen', label: 'Pháp quyền', name: 'Nhà nước pháp quyền' },
  { id: 'trong-sach', label: 'Trong sạch', name: 'Nhà nước trong sạch, vững mạnh' },
]

export const PILLAR_BY_ID = Object.fromEntries(PILLARS.map((p) => [p.id, p])) as Record<PillarId, Pillar>
