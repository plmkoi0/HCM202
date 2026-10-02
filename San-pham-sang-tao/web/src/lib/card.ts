/** Khổ thẻ kết quả PNG (mục 6) */
export type CardFormat = 'story' | 'square'
export const CARD_SIZE: Record<CardFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
}
