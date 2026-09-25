import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { quiz } from '../../lib/data'
import { fmt } from '../../lib/format'
import { CARD_SIZE, copyText, shareUrl, type CardFormat } from '../../lib/share'
import { site } from '../../lib/site'
import type { CitizenTypeId } from '../../types'
import Todo from '../ui/Todo'
import ShareCard from './ShareCard'

const btn = 'rounded-sm border-2 border-ink px-4 py-2 font-semibold hover:bg-ink hover:text-paper disabled:opacity-50'

/** Tải thẻ kết quả PNG, sao chép link, chia sẻ (mục 6). */
export default function ShareActions({ typeId }: { typeId: CitizenTypeId }) {
  const ui = site.share
  const type = quiz.types.find((t) => t.id === typeId)!
  const url = shareUrl(typeId)
  const cardRef = useRef<HTMLDivElement>(null)
  const [format, setFormat] = useState<CardFormat | null>(null)
  const [qr, setQr] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!url) return
    QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark: '#1F1B16', light: '#F4EDE0' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [url])

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
        a.download = `cua-dan-do-dan-vi-dan-${typeId}-${w}x${h}.png`
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
  }, [format, typeId, ui.generateFailed])

  const download = (f: CardFormat) => {
    setStatus(ui.generating)
    setFormat(f)
  }

  const copy = async () => {
    if (!url) return
    setStatus((await copyText(url)) ? ui.copied : `${ui.copyFailed} ${url}`)
  }

  const share = async () => {
    if (!url) return
    if (!navigator.share) return copy()
    try {
      await navigator.share({ title: site.name, text: fmt(ui.shareText, { name: type.name }), url })
    } catch (e) {
      // Người dùng tự hủy thì bỏ qua; lỗi khác thì sao chép link
      if ((e as DOMException)?.name !== 'AbortError') await copy()
    }
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-bold">{ui.title}</h4>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className={btn} disabled={!!format || (!!url && !qr)} onClick={() => download('story')}>
          {ui.downloadStory}
        </button>
        <button type="button" className={btn} disabled={!!format || (!!url && !qr)} onClick={() => download('square')}>
          {ui.downloadSquare}
        </button>
        <button type="button" className={btn} disabled={!url} onClick={copy}>
          {ui.copy}
        </button>
        <button type="button" className={btn} disabled={!url} onClick={share}>
          {ui.share}
        </button>
      </div>
      {!url && (
        <div className="mt-3">
          <Todo note={ui.noUrl} />
        </div>
      )}
      <p role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-medium break-all">
        {status}
      </p>

      {format && (!url || qr) && (
        <div aria-hidden="true" style={{ position: 'fixed', left: -20000, top: 0, pointerEvents: 'none' }}>
          <ShareCard ref={cardRef} type={type} format={format} qr={qr} url={url} />
        </div>
      )}
    </div>
  )
}
