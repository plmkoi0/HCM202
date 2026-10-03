// Luật chơi có minh họa (mục 12.9): đường đi, các loại ô, power-up, thẻ bẫy, kết thúc, cách chơi,
// tùy chọn, phím tắt. Số liệu đọc từ dữ liệu (board, rules, powerups, traps), chữ ở site.json.
import { ArrowRight } from 'lucide-react'
import { cellLegendItems, POWERUP_FILL, Swatch, TRAP_FILL, TRAP_ICON } from '../components/Board'
import { POWERUP_ICONS, TRAP_ICONS } from '../components/icons'
import { geometry } from '../engine/board'
import { gameData, site, tokens } from '../lib/gameData'
import { fill } from '../lib/text'

const data = gameData
const sec = (ms: number) => Math.round(ms / 1000)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-serif text-xl font-bold">{title}</h2>
      {children}
    </section>
  )
}

/** Nội dung Luật chơi — dùng ở màn riêng và trong cửa sổ Menu của ván */
export function RulesContent() {
  const t = site.rules
  const timers = data.rules.timers
  const limits = data.rules.timeLimitOptions.map((m) => (m === null ? site.setup.noLimit.toLowerCase() : fill(site.setup.minutes, { n: m }))).join(' / ')
  const layouts = Object.entries(data.board.layouts).map(([id, l]) => ({ id, label: l.label, geo: geometry(data, id) }))
  const main = layouts.find((l) => l.id === data.board.defaultLayout) ?? layouts[0]
  const ringSteps = main.geo.finishStep - main.geo.homeLength - 1
  const color = tokens.colors[0].color
  const path = [
    { key: 'gate', swatch: <Swatch bg={color} stroke="var(--ink)" icon="gate" iconColor="#fff" />, label: t.pathGate },
    { key: 'ring', swatch: <Swatch bg="var(--surface)" stroke={data.pillars[0].color} icon="question" iconColor="var(--ink-soft)" strokeWidth={3.5} />, label: fill(t.pathRing, { n: ringSteps }) },
    {
      key: 'home',
      swatch: <Swatch bg={`color-mix(in srgb, ${color} 20%, var(--surface))`} stroke={data.pillars[1].color} icon="question" iconColor="var(--ink-soft)" strokeWidth={3.5} />,
      label: fill(t.pathHome, { n: main.geo.homeLength }),
    },
    { key: 'finish', swatch: <Swatch bg={POWERUP_FILL} stroke="var(--ink)" icon="finish" iconColor="#5A3B00" />, label: t.pathFinish },
  ]
  const totalWeight = data.traps.cards.reduce((a, c) => a + c.weight, 0)
  return (
    <div className="flex flex-col gap-6">
      <p className="leading-relaxed">{t.intro}</p>
      <Section title={t.goalTitle}>
        <p className="leading-relaxed">{t.goal}</p>
      </Section>

      <Section title={t.pathTitle}>
        <ol className="board-light flex flex-wrap items-center gap-x-1 gap-y-2 rounded-2xl p-3" aria-label={t.pathTitle}>
          {path.map((p, i) => (
            <li key={p.key} className="flex items-center gap-1">
              {i > 0 && <ArrowRight size={16} className="shrink-0 text-ink-soft" aria-hidden="true" />}
              {p.swatch}
              <span className="text-sm font-semibold">{p.label}</span>
            </li>
          ))}
        </ol>
        {layouts.map((l) => (
          <p key={l.id} className="text-sm text-ink-soft">
            {fill(t.pathNote, { name: l.label, steps: l.geo.finishStep })}
          </p>
        ))}
      </Section>

      <Section title={t.turnTitle}>
        <ol className="flex list-decimal flex-col gap-1.5 pl-6 leading-relaxed">
          {t.turn.map((line, i) => (
            <li key={i}>{fill(line, { roll: sec(timers.rollMs), answer: sec(timers.answerMs) })}</li>
          ))}
        </ol>
      </Section>

      <Section title={t.cellsTitle}>
        <ul className="board-light flex flex-col gap-2 rounded-2xl p-3">
          {cellLegendItems(data).map((it) => (
            <li key={it.key} className="flex items-start gap-2">
              {it.swatch}
              <span>
                <span className="font-semibold">{it.label}</span>
                {it.text ? ` — ${it.text}` : ''}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-sm">{t.pillarsNote}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {data.pillars.map((p) => (
            <li key={p.id} className="flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded-full border-4" style={{ borderColor: p.color }} aria-hidden="true" />
              <span className="font-bold">{p.abbr}</span>
              <span>{p.label}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.powerupsTitle}>
        <ul className="flex flex-col gap-2">
          {data.powerups.items.map((p) => {
            const I = POWERUP_ICONS[p.id]
            return (
              <li key={p.id} className="flex items-start gap-3 rounded-2xl border border-line p-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink" style={{ background: POWERUP_FILL }} aria-hidden="true">
                  <I size={18} color="#5A3B00" />
                </span>
                <span>
                  <span className="font-semibold">{p.label}</span>{' '}
                  <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold">{p.kind === 'instant' ? t.instant : t.bag}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed">{p.effect}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="text-sm text-ink-soft">{fill(t.bagNote, { n: data.powerups.bagSize })}</p>
      </Section>

      <Section title={t.trapsTitle}>
        <ul className="flex flex-col gap-2">
          {data.traps.cards.map((c) => {
            const I = TRAP_ICONS[c.kind]
            return (
              <li key={c.id} className="flex items-start gap-3 rounded-2xl border border-line p-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink" style={{ background: TRAP_FILL }} aria-hidden="true">
                  {I && <I size={18} color={TRAP_ICON} />}
                </span>
                <span>
                  <span className="font-semibold">{fill(c.label, { n: t.trapRange })}</span> <span className="text-sm text-ink-soft">({Math.round((c.weight / totalWeight) * 100)}%)</span>
                  <span className="mt-0.5 block text-sm leading-relaxed">{fill(c.effect ?? '', { n: t.trapRange })}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="text-sm text-ink-soft">{t.trapsNote}</p>
      </Section>

      <Section title={t.endTitle}>
        <ul className="flex list-disc flex-col gap-1.5 pl-6 leading-relaxed">
          {t.end.map((line, i) => (
            <li key={i}>{fill(line, { limits, message: site.message })}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.modesTitle}>
        <ul className="flex list-disc flex-col gap-1.5 pl-6 leading-relaxed">
          {t.modes.map((line, i) => (
            <li key={i}>{fill(line, { disconnect: sec(timers.disconnectMs) })}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.optionsTitle}>
        <ul className="flex list-disc flex-col gap-1.5 pl-6 leading-relaxed">
          {t.options.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.keysTitle}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          {t.keys.map(([k, v]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="kbd">{k}</kbd>
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  )
}

export function Rules({ onBack }: { onBack: () => void }) {
  const t = site.rules
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t.back}
        </button>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t.title}</h1>
      </header>
      <RulesContent />
      <button type="button" className="btn-secondary self-start" onClick={onBack}>
        ← {t.back}
      </button>
    </main>
  )
}
