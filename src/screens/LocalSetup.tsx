// Thiết lập "Chơi trên một máy" (mục 12.7): 1–5 người + số máy chơi cùng, màu ngựa không
// trùng, cài đặt ván (mục 5, 10). 1 người, 0 máy = thử thách cá nhân.
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { SymbolShape } from '../components/icons'
import type { AfterFirstFinish } from '../engine/types'
import { SETUP_KEY, type LocalSetup as Setup } from '../game/local'
import { gameData, site, tokens } from '../lib/gameData'
import { load, save } from '../lib/storage'
import { cleanNickname, fill } from '../lib/text'

interface Draft {
  humans: { name: string; color: number }[]
  bots: number
  layout: string
  timeLimitMin: number | null
  horsesPerPlayer: number
  exactFinish: boolean
  startFromStable: boolean
  afterFirstFinish: AfterFirstFinish
}

const rules = gameData.rules
const MAX = rules.maxPlayers

function defaultDraft(): Draft {
  const d = rules.defaults
  return {
    humans: [{ name: fill(site.setup.defaultName, { n: 1 }), color: 0 }],
    bots: 0,
    layout: d.layout ?? gameData.board.defaultLayout,
    timeLimitMin: d.timeLimitMin ?? null,
    horsesPerPlayer: d.horsesPerPlayer ?? 1,
    exactFinish: d.exactFinish ?? false,
    startFromStable: d.startFromStable ?? false,
    afterFirstFinish: d.afterFirstFinish ?? 'stop',
  }
}

/** Thiết lập nhớ lần trước có thể không còn hợp lệ (dữ liệu đổi) → giữ phần hợp lệ, bỏ phần sai */
function sanitize(saved: Partial<Draft> | null): Draft {
  const d = defaultDraft()
  if (!saved || typeof saved !== 'object') return d
  const humans: Draft['humans'] = []
  const used: number[] = []
  for (const h of Array.isArray(saved.humans) ? saved.humans.slice(0, MAX) : []) {
    if (!h || typeof h.name !== 'string') continue
    let color = Number.isInteger(h.color) && h.color >= 0 && h.color < tokens.colors.length && !used.includes(h.color) ? h.color : firstFree(used)
    if (used.includes(color)) color = firstFree(used)
    used.push(color)
    humans.push({ name: h.name.slice(0, 40), color })
  }
  if (humans.length > 0) d.humans = humans
  if (Number.isInteger(saved.bots)) d.bots = Math.max(0, Math.min(MAX - d.humans.length, saved.bots!))
  if (saved.layout && gameData.board.layouts[saved.layout]) d.layout = saved.layout
  if (saved.timeLimitMin !== undefined && rules.timeLimitOptions.includes(saved.timeLimitMin)) d.timeLimitMin = saved.timeLimitMin
  if (saved.horsesPerPlayer !== undefined && rules.options.horsesPerPlayer.includes(saved.horsesPerPlayer)) d.horsesPerPlayer = saved.horsesPerPlayer
  if (typeof saved.exactFinish === 'boolean') d.exactFinish = saved.exactFinish
  if (typeof saved.startFromStable === 'boolean') d.startFromStable = saved.startFromStable
  if (saved.afterFirstFinish && rules.options.afterFirstFinish.includes(saved.afterFirstFinish)) d.afterFirstFinish = saved.afterFirstFinish
  return d
}

function firstFree(used: number[]): number {
  for (let c = 0; c < tokens.colors.length; c++) if (!used.includes(c)) return c
  return 0
}

export function LocalSetup({ onStart, onBack }: { onStart: (s: Setup) => void; onBack: () => void }) {
  const [d, setD] = useState<Draft>(() => sanitize(load<Partial<Draft> | null>(SETUP_KEY, null)))
  const t = site.setup
  const total = d.humans.length + d.bots
  const names = d.humans.map((h) => cleanNickname(h.name))
  const valid = names.every((n) => n !== null) && total >= 1 && total <= MAX
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }))

  const start = () => {
    if (!valid) return
    save(SETUP_KEY, d)
    const used = d.humans.map((h) => h.color)
    const players = d.humans.map((h, i) => ({ name: names[i]!, color: h.color, isBot: false }))
    for (let b = 0; b < d.bots; b++) {
      const color = firstFree(used)
      used.push(color)
      players.push({ name: gameData.bots.names[b % gameData.bots.names.length], color, isBot: true })
    }
    onStart({
      players,
      config: {
        layout: d.layout,
        timeLimitMin: d.timeLimitMin,
        horsesPerPlayer: d.horsesPerPlayer,
        exactFinish: d.exactFinish,
        startFromStable: d.startFromStable,
        afterFirstFinish: d.afterFirstFinish,
      },
    })
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t.back}
        </button>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t.title}</h1>
        <p className="text-ink-soft">{t.intro}</p>
      </header>

      <section className="card flex flex-col gap-3">
        <h2 className="text-lg font-bold">{t.players}</h2>
        {d.humans.map((h, i) => {
          const others = d.humans.filter((_, k) => k !== i).map((x) => x.color)
          return (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-line p-3">
              <div className="flex items-end gap-2">
                <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
                  {fill(t.nameLabel, { n: i + 1 })}
                  <input
                    className="input"
                    value={h.name}
                    maxLength={20}
                    aria-invalid={names[i] === null}
                    onChange={(e) => set({ humans: d.humans.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })}
                  />
                </label>
                {d.humans.length > 1 && (
                  <button type="button" className="btn-icon" aria-label={t.removePlayer} onClick={() => set({ humans: d.humans.filter((_, k) => k !== i) })}>
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              {names[i] === null && <p className="text-sm text-bad">{t.nameError}</p>}
              <fieldset>
                <legend className="mb-1 text-sm font-semibold">{t.colorLabel}</legend>
                <div className="flex flex-wrap gap-2">
                  {tokens.colors.map((c, ci) => {
                    const taken = others.includes(ci)
                    return (
                      <label key={c.id} className={`color-pick ${h.color === ci ? 'color-pick-on' : ''} ${taken ? 'opacity-30' : ''}`} style={{ background: c.color }}>
                        <input
                          type="radio"
                          name={`color-${i}`}
                          className="sr-only"
                          checked={h.color === ci}
                          disabled={taken}
                          onChange={() => set({ humans: d.humans.map((x, k) => (k === i ? { ...x, color: ci } : x)) })}
                        />
                        <svg width={22} height={22} viewBox="-11 -11 22 22" aria-hidden="true">
                          <SymbolShape symbol={c.symbol} s={14} fill="#fff" />
                        </svg>
                        <span className="sr-only">
                          {c.name} ({c.symbolLabel})
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          )
        })}
        {total < MAX && (
          <button
            type="button"
            className="btn-secondary self-start"
            onClick={() => set({ humans: [...d.humans, { name: fill(t.defaultName, { n: d.humans.length + 1 }), color: firstFree(d.humans.map((x) => x.color)) }] })}
          >
            <Plus size={18} aria-hidden="true" /> {t.addPlayer}
          </button>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold">{t.bots}</span>
          <div className="flex items-center gap-1">
            <button type="button" className="btn-icon" aria-label={`${t.bots} −`} disabled={d.bots === 0} onClick={() => set({ bots: d.bots - 1 })}>
              <Minus size={18} />
            </button>
            <output className="w-8 text-center text-lg font-bold" aria-live="polite">
              {d.bots}
            </output>
            <button type="button" className="btn-icon" aria-label={`${t.bots} +`} disabled={total >= MAX} onClick={() => set({ bots: d.bots + 1 })}>
              <Plus size={18} />
            </button>
          </div>
          <span className="text-sm text-ink-soft">{fill(t.botsHint, { max: MAX })}</span>
        </div>
        {d.humans.length === 1 && d.bots === 0 && <p className="rounded-xl bg-bg p-2 text-sm">{t.soloHint}</p>}
      </section>

      <section className="card flex flex-col gap-4">
        <h2 className="text-lg font-bold">{t.settings}</h2>
        <fieldset>
          <legend className="mb-1 font-semibold">{t.timeLimit}</legend>
          <div className="flex flex-wrap gap-2">
            {rules.timeLimitOptions.map((m) => (
              <label key={String(m)} className={`seg ${d.timeLimitMin === m ? 'seg-on' : ''}`}>
                <input type="radio" name="time" className="sr-only" checked={d.timeLimitMin === m} onChange={() => set({ timeLimitMin: m })} />
                {m === null ? t.noLimit : fill(t.minutes, { n: m })}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 font-semibold">{t.layout}</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(gameData.board.layouts).map(([id, l]) => (
              <label key={id} className={`seg ${d.layout === id ? 'seg-on' : ''}`}>
                <input type="radio" name="layout" className="sr-only" checked={d.layout === id} onChange={() => set({ layout: id })} />
                {l.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{t.layoutHint}</p>
        </fieldset>
        <fieldset>
          <legend className="mb-1 font-semibold">{t.horses}</legend>
          <div className="flex flex-wrap gap-2">
            {rules.options.horsesPerPlayer.map((n) => (
              <label key={n} className={`seg ${d.horsesPerPlayer === n ? 'seg-on' : ''}`}>
                <input type="radio" name="horses" className="sr-only" checked={d.horsesPerPlayer === n} onChange={() => set({ horsesPerPlayer: n })} />
                {n}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 font-semibold">{t.afterFirstFinish}</legend>
          <div className="flex flex-wrap gap-2">
            {(['stop', 'continue'] as const).map((v) => (
              <label key={v} className={`seg ${d.afterFirstFinish === v ? 'seg-on' : ''}`}>
                <input type="radio" name="after" className="sr-only" checked={d.afterFirstFinish === v} onChange={() => set({ afterFirstFinish: v })} />
                {t[v]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={d.exactFinish} onChange={(e) => set({ exactFinish: e.target.checked })} />
          {t.exactFinish}
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5" checked={d.startFromStable} onChange={(e) => set({ startFromStable: e.target.checked })} />
          {t.startFromStable}
        </label>
      </section>

      <button type="button" className="btn-primary btn-big" disabled={!valid} onClick={start}>
        {t.start}
      </button>
    </main>
  )
}
