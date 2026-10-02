import { toPng } from 'html-to-image'
import { useEffect, useRef, useState } from 'react'
import { CARD_SIZE, type CardFormat } from '../../lib/card'
import { quiz } from '../../lib/data'
import { site } from '../../lib/site'
import type { Level } from '../../types'
import ShareCard from './ShareCard'

const btn = 'rounded-sm border-2 border-ink px-4 py-2 font-semibold hover:bg-ink hover:text-paper disabled:opacity-50'

interface Props {
  level: Level
  points: number
}

/** Tải thẻ kết quả PNG 1080×1920 và 1080×1080 (mục 6). */
export default function ShareActions({ level, points }: Props) {
  const ui = site.share
  const total = quiz.questions.length
  const cardRef = useRef<HTMLDivElement>(null)
  const [format, setFormat] = useState<CardFormat | null>(null)
  const [status, setStatus] = useState('')

  // Khi thẻ đã được dựng ngoài màn hình: chờ font rồi chụp
  useEffect(() => {
    if (!format || !cardRef.current) return
    let cancelled = false
    const { w, h } = CARD_SIZE[format]
    ;(async () => {
      try {
        await document.fonts.ready
        const dataUrl = await toPng(cardRef.current!, { width: w, height: h, pixelRatio: 1, cacheBust: true })
        if (cancelled) return
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `cua-dan-do-dan-vi-dan-${level.id}-${w}x${h}.png`
        a.click()
        setStatus('')
      } catch {
        if (!cancelled) setStatus(ui.generateFailed)
      } finally {
        if (!cancelled) setFormat(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [format, level.id, ui.generateFailed])

  const download = (f: CardFormat) => {
    setStatus(ui.generating)
    setFormat(f)
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-bold">{ui.title}</h4>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className={btn} disabled={!!format} onClick={() => download('story')}>
          {ui.downloadStory}
        </button>
        <button type="button" className={btn} disabled={!!format} onClick={() => download('square')}>
          {ui.downloadSquare}
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-medium">
        {status}
      </p>

      {format && (
        <div aria-hidden="true" style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
          <ShareCard ref={cardRef} level={level} points={points} total={total} format={format} />
        </div>
      )}
    </div>
  )
}
