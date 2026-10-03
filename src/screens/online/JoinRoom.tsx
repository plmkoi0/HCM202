// Vào phòng (mục 9): mã 5 ký tự (hoặc từ link /p/ABCDE, mã QR) → xem phòng (màu đã chọn) → biệt danh + màu.
import { useEffect, useState } from 'react'
import type { RoomPeek, StateView } from '../../../server/types'
import { ColorPicker } from '../../components/ColorPicker'
import { site, tokens } from '../../lib/gameData'
import { cleanNickname, fill } from '../../lib/text'
import type { Session } from '../../net/api'
import { loadProfile, storeProfile } from '../../online/session'
import { api } from '../../online/useRoom'
import { errorText } from './errors'

const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}$/

export function normalizeInput(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase().slice(0, 5)
}

export function JoinRoom({ initialCode, onEnter, onBack }: { initialCode?: string; onEnter: (s: Session, v: StateView) => void; onBack: () => void }) {
  const t = site.online
  const prof = loadProfile()
  const [code, setCode] = useState(initialCode ?? '')
  const [peek, setPeek] = useState<RoomPeek | null>(null)
  const [name, setName] = useState(prof?.name ?? '')
  const [color, setColor] = useState(prof?.color ?? 0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clean = cleanNickname(name)
  const codeOk = CODE_RE.test(code)

  const check = async (c: string) => {
    setBusy(true)
    setError(null)
    try {
      const p = await api.peek(c)
      setPeek(p)
      if (p.status !== 'lobby') setError(errorText(p.seats >= p.capacity ? 'ROOM_FULL' : 'ROOM_STARTED'))
      else if (p.seats >= p.capacity) setError(errorText('ROOM_FULL'))
      // màu nhớ lần trước đã có người chọn → chọn màu trống đầu tiên
      setColor((cur) => (p.takenColors.includes(cur) ? Math.max(0, tokens.colors.findIndex((_, i) => !p.takenColors.includes(i))) : cur))
    } catch (e) {
      setPeek(null)
      setError(errorText(e))
    }
    setBusy(false)
  }

  useEffect(() => {
    if (initialCode && CODE_RE.test(initialCode)) void check(initialCode)
    // chỉ chạy một lần khi mở từ link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const join = async () => {
    if (!peek || !clean || busy) return
    setBusy(true)
    setError(null)
    try {
      storeProfile({ name: clean, color })
      const r = await api.join(peek.code, { name: clean, color })
      onEnter({ code: r.code, playerId: r.playerId, token: r.token }, r.state)
    } catch (e) {
      setError(errorText(e))
      setBusy(false)
      // màu vừa bị người khác chọn → xem lại phòng
      void api.peek(peek.code).then(setPeek, () => {})
    }
  }

  const canJoin = !!peek && peek.status === 'lobby' && peek.seats < peek.capacity
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
      <header>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t.back}
        </button>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t.joinTitle}</h1>
        <p className="text-ink-soft">{t.joinIntro}</p>
      </header>
      <form
        className="card flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (codeOk) void check(code)
        }}
      >
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t.code}
          <input
            className="input text-center font-mono text-2xl tracking-[0.3em] uppercase"
            value={code}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={7}
            aria-invalid={code.length === 5 && !codeOk}
            onChange={(e) => {
              setCode(normalizeInput(e.target.value))
              setPeek(null)
            }}
          />
        </label>
        {code.length === 5 && !codeOk && <p className="text-sm text-bad">{t.codeError}</p>}
        {!peek && (
          <button type="submit" className="btn-secondary" disabled={!codeOk || busy}>
            {t.check}
          </button>
        )}
      </form>
      {peek && canJoin && (
        <section className="card flex flex-col gap-3">
          <p className="font-semibold">{fill(t.roomInfo, { code: peek.code, seats: peek.seats, capacity: peek.capacity })}</p>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t.nickname}
            <input className="input" value={name} maxLength={20} autoComplete="nickname" onChange={(e) => setName(e.target.value)} />
          </label>
          {name !== '' && !clean && <p className="text-sm text-bad">{site.setup.nameError}</p>}
          <ColorPicker name="join-color" legend={t.color} value={color} taken={peek.takenColors} onChange={setColor} />
          <button type="button" className="btn-primary btn-big" disabled={!clean || busy || peek.takenColors.includes(color)} onClick={() => void join()}>
            {busy ? t.joining : t.joinButton}
          </button>
        </section>
      )}
      {error && (
        <p role="alert" className="rounded-xl border-2 border-bad p-3 text-bad">
          {error}
        </p>
      )}
    </main>
  )
}
