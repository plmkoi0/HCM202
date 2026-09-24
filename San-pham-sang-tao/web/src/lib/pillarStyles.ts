import type { PillarId } from '../types'

export const PILLAR_CHIP: Record<PillarId, string> = {
  'dan-chu': 'bg-son text-on-son',
  'phap-quyen': 'bg-muc text-on-muc',
  'trong-sach': 'bg-dong text-on-dong',
}

export const PILLAR_BORDER: Record<PillarId, string> = {
  'dan-chu': 'border-son',
  'phap-quyen': 'border-muc',
  'trong-sach': 'border-dong',
}

export const PILLAR_TEXT: Record<PillarId, string> = {
  'dan-chu': 'text-son-text',
  'phap-quyen': 'text-muc-text',
  'trong-sach': 'text-dong-text',
}
