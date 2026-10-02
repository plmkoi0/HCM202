import { forwardRef } from 'react'
import { quiz } from '../../lib/data'
import { fmt } from '../../lib/format'
import { CARD_SIZE, type CardFormat } from '../../lib/card'
import { site } from '../../lib/site'
import type { Level } from '../../types'

// Thẻ luôn dùng bảng màu sáng (mục 7), không phụ thuộc chế độ tối của người xem
const C = { paper: '#F4EDE0', ink: '#1F1B16', soft: '#5A5044', son: '#A4262C', line: '#D6C7AD' }
const SERIF = "'Noto Serif', Georgia, serif"
const SANS = "'Be Vietnam Pro', system-ui, sans-serif"

interface Props {
  level: Level
  points: number
  total: number
  format: CardFormat
}

/**
 * Thẻ kết quả để chụp thành PNG (html-to-image): tiêu đề quiz, điểm x/10,
 * tên mức, câu closing, tên web.
 */
const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard({ level, points, total, format }, ref) {
  const { w, h } = CARD_SIZE[format]
  const story = format === 'story'
  const pad = story ? 96 : 72
  return (
    <div
      ref={ref}
      style={{
        width: w,
        height: h,
        background: C.paper,
        color: C.ink,
        fontFamily: SANS,
        padding: pad,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: `24px solid ${C.son}`,
      }}
    >
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: story ? 72 : 54, lineHeight: 1.2 }}>{site.quiz.title}</div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span style={{ fontSize: story ? 34 : 28, letterSpacing: 6, textTransform: 'uppercase', color: C.soft, fontWeight: 600 }}>
            {site.quiz.scoreLabel}
          </span>
          <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: story ? 220 : 150, lineHeight: 1, color: C.son }}>
            {fmt(site.quiz.scoreValue, { score: points, total })}
          </span>
        </div>
        <div
          style={{
            marginTop: story ? 56 : 32,
            display: 'inline-block',
            border: `6px double ${C.son}`,
            padding: story ? '28px 40px' : '18px 30px',
            transform: 'rotate(-3deg)',
            color: C.son,
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: story ? 96 : 68,
            lineHeight: 1.1,
          }}
        >
          {level.name}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: story ? 52 : 44,
            borderTop: `2px solid ${C.line}`,
            borderBottom: `2px solid ${C.line}`,
            padding: story ? '36px 0' : '20px 0',
            textAlign: 'center',
          }}
        >
          {quiz.closing}
        </div>
        <div style={{ marginTop: story ? 48 : 28, fontFamily: SERIF, fontWeight: 700, fontSize: story ? 38 : 30, lineHeight: 1.3 }}>
          {site.name}
        </div>
      </div>
    </div>
  )
})

export default ShareCard
