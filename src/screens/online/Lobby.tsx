// Phòng chờ (mục 9): mã phòng to, mã QR, sao chép link, chia sẻ; danh sách x/N kèm màu và trạng thái
// kết nối; chủ phòng chỉnh cài đặt, số chỗ, thêm/bớt máy chơi cùng, mời ra, Bắt đầu.
import { Bot, Copy, Crown, Plus, Share2, UserX, WifiOff, X } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import type { ClientAction, StateView } from '../../../server/types'
import { ColorPicker } from '../../components/ColorPicker'
import { SymbolShape } from '../../components/icons'
import { gameData, site, tokens } from '../../lib/gameData'
import { fill } from '../../lib/text'
import { inviteLink } from '../../online/session'
import { RoomSettings } from './RoomSettings'

type Act = (a: ClientAction) => Promise<{ ok: true } | { ok: false; error: string; message?: string }>

export function Lobby({ view, act, onLeave, report }: { view: StateView; act: Act; onLeave: () => void; report: (msg: string) => void }) {
  const t = site.online
  const r = view.room
  const me = r.members.find((m) => m.id === view.you)
  const isHost = r.hostId === view.you
  const link = inviteLink(r.code)
  const [qr, setQr] = useState('')
  useEffect(() => {
    let alive = true
    void QRCode.toString(link, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }).then((svg) => alive && setQr(svg))
    return () => {
      alive = false
    }
  }, [link])
  const run = async (a: ClientAction) => {
    const res = await act(a)
    if (!res.ok) report((site.errors as Record<string, string>)[res.error] ?? res.message ?? res.error)
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      report(t.copied)
    } catch {
      window.prompt(t.copyLink, link)
    }
  }
  const share = async () => {
    try {
      await navigator.share({ title: site.title, text: fill(t.shareText, { code: r.code }), url: link })
    } catch {
      // người dùng hủy chia sẻ
    }
  }
  const humans = r.members.filter((m) => !m.isBot).length
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold">{t.lobbyTitle}</h1>
          <p className="text-ink-soft">{isHost ? '' : t.waitHost}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onLeave}>
          {t.leave}
        </button>
      </header>
      <section className="card flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col items-center gap-3 sm:items-start">
          <p className="text-sm font-semibold text-ink-soft">{t.roomCode}</p>
          <p className="font-mono text-5xl font-bold tracking-[0.2em]" data-room-code={r.code}>
            {r.code}
          </p>
          <p className="break-all text-sm text-ink-soft">{link}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => void copy()}>
              <Copy size={18} aria-hidden="true" /> {t.copyLink}
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button type="button" className="btn-secondary" onClick={() => void share()}>
                <Share2 size={18} aria-hidden="true" /> {t.share}
              </button>
            )}
          </div>
        </div>
        {qr && <div className="w-44 rounded-2xl bg-white p-2" role="img" aria-label={fill(t.qrLabel, { code: r.code })} dangerouslySetInnerHTML={{ __html: qr }} />}
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="text-lg font-bold">{fill(t.members, { n: r.members.length, capacity: r.capacity })}</h2>
        <ul className="flex flex-col gap-2">
          {r.members.map((m) => {
            const tok = tokens.colors[m.color]!
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-line p-2">
                <svg width={32} height={32} viewBox="-16 -16 32 32" aria-hidden="true">
                  <circle r={15} fill={tok.color} />
                  <SymbolShape symbol={tok.symbol} s={15} fill="#fff" />
                </svg>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {m.name}
                  {m.id === view.you && <span className="ml-1 text-sm font-normal text-ink-soft">({t.you})</span>}
                </span>
                {m.isHost && (
                  <span className="inline-flex items-center gap-1 text-sm text-accent-text">
                    <Crown size={16} aria-hidden="true" /> {t.host}
                  </span>
                )}
                {m.isBot && (
                  <span className="inline-flex items-center gap-1 text-sm text-ink-soft">
                    <Bot size={16} aria-hidden="true" /> {t.bot}
                  </span>
                )}
                {!m.connected && (
                  <span className="inline-flex items-center gap-1 text-sm text-bad">
                    <WifiOff size={16} aria-hidden="true" /> {t.offline}
                  </span>
                )}
                {isHost && m.id !== view.you && (
                  <button
                    type="button"
                    className="btn-icon"
                    aria-label={fill(m.isBot ? t.removeBot : t.kick, { name: m.name })}
                    title={fill(m.isBot ? t.removeBot : t.kick, { name: m.name })}
                    onClick={() => void run(m.isBot ? { type: 'REMOVE_BOT', playerId: m.id } : { type: 'KICK', playerId: m.id })}
                  >
                    {m.isBot ? <X size={18} /> : <UserX size={18} />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {isHost && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary" disabled={r.members.length >= r.capacity} onClick={() => void run({ type: 'ADD_BOT' })}>
              <Plus size={18} aria-hidden="true" /> {t.addBot}
            </button>
            <fieldset className="flex flex-wrap items-center gap-2">
              <legend className="sr-only">{t.capacity}</legend>
              <span className="text-sm font-semibold">{t.capacity}:</span>
              {Array.from({ length: gameData.rules.maxPlayers }, (_, i) => i + 1).map((n) => (
                <label key={n} className={`seg ${r.capacity === n ? 'seg-on' : ''} ${n < r.members.length ? 'opacity-40' : ''}`}>
                  <input type="radio" name="lobby-capacity" className="sr-only" checked={r.capacity === n} disabled={n < r.members.length} onChange={() => void run({ type: 'SET_CAPACITY', capacity: n })} />
                  {n}
                </label>
              ))}
            </fieldset>
          </div>
        )}
        {me && <ColorPicker name="lobby-color" legend={t.changeColor} value={me.color} taken={r.members.map((m) => m.color)} onChange={(c) => void run({ type: 'SET_COLOR', color: c })} />}
      </section>

      <section className="card flex flex-col gap-3">
        <h2 className="text-lg font-bold">{t.settings}</h2>
        {!isHost && <p className="text-sm text-ink-soft">{t.settingsHostOnly}</p>}
        <RoomSettings id="lobby" config={r.config} disabled={!isHost} onChange={(p) => void run({ type: 'SET_CONFIG', config: p })} />
      </section>

      {isHost ? (
        <button type="button" className="btn-primary btn-big" disabled={humans < 1} onClick={() => void run({ type: 'START' })}>
          {t.start}
        </button>
      ) : (
        <p className="text-center font-semibold text-ink-soft" aria-live="polite">
          {t.waitHost}
        </p>
      )}
    </main>
  )
}
