import { forwardRef } from 'react'
import { quiz } from '../../lib/data'
import { site } from '../../lib/site'
import { CARD_SIZE, type CardFormat } from '../../lib/share'
import type { CitizenType } from '../../types'


// Thẻ luôn dùng bảng màu sáng (mục 7), không phụ thuộc chế độ tối của người xem
const C = { paper: '#F4EDE0', ink: '#1F1B16', soft: '#5A5044', son: '#A4262C', line: '#D6C7AD' }
const SERIF = "'Noto Serif', Georgia, serif"
const SANS = "'Be Vietnam Pro', system-ui, sans-serif"

interface Props {
  type: CitizenType
  format: CardFormat
  qr: string
  url: string
}

/** Thẻ kết quả để chụp thành PNG (html-to-image). */
const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard({ type, format, qr, url }, ref) {
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
      <div>
        <div style={{ fontSize: story ? 34 : 28, letterSpacing: 6, textTransform: 'uppercase', color: C.soft, fontWeight: 600 }}>
          {site.share.cardEyebrow}
        </div>
        <div
          style={{
            marginTop: story ? 48 : 28,
            display: 'inline-block',
            border: `6px double ${C.son}`,
            padding: story ? '28px 40px' : '18px 30px',
            transform: 'rotate(-3deg)',
            color: C.son,
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: story ? 104 : 76,
            lineHeight: 1.1,
          }}
        >
          {type.name}
        </div>
      </div>

      <div style={{ fontFamily: SERIF, fontSize: story ? 50 : 36, lineHeight: 1.45 }}>
        {type.quote.lead && <span style={{ color: C.soft }}>{type.quote.lead} </span>}
        <span style={{ fontStyle: type.quote.paraphrase ? 'normal' : 'italic' }}>
          {type.quote.paraphrase ? type.quote.text : `“${type.quote.text}”`}
        </span>
        <div style={{ marginTop: 20, fontFamily: SANS, fontSize: story ? 32 : 26, color: C.soft, fontWeight: 500 }}>
          ({type.quote.cite})
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: story ? 60 : 44,
            borderTop: `2px solid ${C.line}`,
            borderBottom: `2px solid ${C.line}`,
            padding: story ? '36px 0' : '20px 0',
            textAlign: 'center',
          }}
        >
          {quiz.closing}
        </div>
        <div style={{ marginTop: story ? 48 : 28, display: 'flex', alignItems: 'center', gap: 36 }}>
          <img src={qr} alt="" width={story ? 220 : 170} height={story ? 220 : 170} style={{ display: 'block' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: story ? 38 : 30, lineHeight: 1.3 }}>{site.name}</div>
            <div style={{ marginTop: 10, fontSize: story ? 28 : 22, color: C.soft }}>{site.share.cardScan}</div>
            <div style={{ marginTop: 6, fontSize: story ? 26 : 20, color: C.soft, wordBreak: 'break-all' }}>{url}</div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ShareCard
