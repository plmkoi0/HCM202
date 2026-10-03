// Tạo phòng (mục 9): biệt danh (nhớ lần trước), màu, số người tối đa 1–5, cài đặt ván.
// 1 người → chọn số máy chơi cùng rồi vào ván ngay.
import { useState } from 'react'
import type { RoomConfig, StateView } from '../../../server/types'
import { ColorPicker } from '../../components/ColorPicker'
import { gameData, site } from '../../lib/gameData'
import { cleanNickname } from '../../lib/text'
import type { Session } from '../../net/api'
import { loadProfile, storeProfile } from '../../online/session'
import { api } from '../../online/useRoom'
import { errorText } from './errors'
import { RoomSettings } from './RoomSettings'

const MAX = gameData.rules.maxPlayers

export function CreateRoom({ onEnter, onBack }: { onEnter: (s: Session, v: StateView) => void; onBack: () => void }) {
  const t = site.online
  const prof = loadProfile()
  const [name, setName] = useState(prof?.name ?? '')
  const [color, setColor] = useState(prof?.color ?? 0)
  const [capacity, setCapacity] = useState(MAX)
  const [bots, setBots] = useState(0)
  const [config, setConfig] = useState<RoomConfig>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clean = cleanNickname(name)

  const submit = async () => {
    if (!clean || busy) return
    setBusy(true)
    setError(null)
    try {
      storeProfile({ name: clean, color })
      const cfg = capacity === 1 ? { ...config, guessAlong: false } : config
      const r = await api.create({ name: clean, color, capacity, config: cfg, bots: capacity === 1 ? bots : 0 })
      onEnter({ code: r.code, playerId: r.playerId, token: r.token }, r.state)
    } catch (e) {
      setError(errorText(e))
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t.back}
        </button>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t.createTitle}</h1>
        <p className="text-ink-soft">{t.createIntro}</p>
      </header>
      <section className="card flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          {t.nickname}
          <input className="input" value={name} maxLength={20} autoComplete="nickname" aria-invalid={name !== '' && !clean} onChange={(e) => setName(e.target.value)} />
        </label>
        {name !== '' && !clean && <p className="text-sm text-bad">{site.setup.nameError}</p>}
        <ColorPicker name="create-color" legend={t.color} value={color} onChange={setColor} />
        <fieldset>
          <legend className="mb-1 font-semibold">{t.capacity}</legend>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => (
              <label key={n} className={`seg ${capacity === n ? 'seg-on' : ''}`}>
                <input type="radio" name="capacity" className="sr-only" checked={capacity === n} onChange={() => setCapacity(n)} />
                {n}
              </label>
            ))}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{t.capacityHint}</p>
        </fieldset>
        {capacity === 1 && (
          <fieldset>
            <legend className="mb-1 font-semibold">{t.soloBots}</legend>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: MAX }, (_, i) => i).map((n) => (
                <label key={n} className={`seg ${bots === n ? 'seg-on' : ''}`}>
                  <input type="radio" name="bots" className="sr-only" checked={bots === n} onChange={() => setBots(n)} />
                  {n}
                </label>
              ))}
            </div>
            {bots === 0 && <p className="mt-1 rounded-xl bg-bg p-2 text-sm">{site.setup.soloHint}</p>}
          </fieldset>
        )}
      </section>
      <section className="card flex flex-col gap-3">
        <h2 className="text-lg font-bold">{t.settings}</h2>
        <RoomSettings id="create" config={config} onChange={(p) => setConfig((c) => ({ ...c, ...p }))} showGuess={capacity > 1} />
      </section>
      {error && (
        <p role="alert" className="rounded-xl border-2 border-bad p-3 text-bad">
          {error}
        </p>
      )}
      <button type="button" className="btn-primary btn-big" disabled={!clean || busy} onClick={() => void submit()}>
        {busy ? t.creating : t.createButton}
      </button>
    </main>
  )
}
