// Cài đặt ván của phòng (mục 5, 10): giới hạn thời gian, bố cục, số ngựa, kết thúc, tùy chọn, Đoán cùng.
import type { RoomConfig } from '../../../server/types'
import { gameData, site } from '../../lib/gameData'
import { fill } from '../../lib/text'

const rules = gameData.rules

export function fullConfig(c: RoomConfig): Required<RoomConfig> {
  const d = rules.defaults
  return {
    layout: c.layout ?? d.layout ?? gameData.board.defaultLayout,
    timeLimitMin: c.timeLimitMin !== undefined ? c.timeLimitMin : (d.timeLimitMin ?? null),
    horsesPerPlayer: c.horsesPerPlayer ?? d.horsesPerPlayer ?? 1,
    exactFinish: c.exactFinish ?? d.exactFinish ?? false,
    startFromStable: c.startFromStable ?? d.startFromStable ?? false,
    guessAlong: c.guessAlong ?? d.guessAlong ?? false,
    afterFirstFinish: c.afterFirstFinish ?? d.afterFirstFinish ?? 'stop',
  }
}

export function RoomSettings({ config, onChange, disabled = false, showGuess = true, id }: { config: RoomConfig; onChange: (patch: RoomConfig) => void; disabled?: boolean; showGuess?: boolean; id: string }) {
  const t = site.setup
  const c = fullConfig(config)
  return (
    <div className="flex flex-col gap-4">
      <fieldset disabled={disabled}>
        <legend className="mb-1 font-semibold">{t.timeLimit}</legend>
        <div className="flex flex-wrap gap-2">
          {rules.timeLimitOptions.map((m) => (
            <label key={String(m)} className={`seg ${c.timeLimitMin === m ? 'seg-on' : ''}`}>
              <input type="radio" name={`${id}-time`} className="sr-only" checked={c.timeLimitMin === m} onChange={() => onChange({ timeLimitMin: m })} />
              {m === null ? t.noLimit : fill(t.minutes, { n: m })}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend className="mb-1 font-semibold">{t.layout}</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(gameData.board.layouts).map(([lid, l]) => (
            <label key={lid} className={`seg ${c.layout === lid ? 'seg-on' : ''}`}>
              <input type="radio" name={`${id}-layout`} className="sr-only" checked={c.layout === lid} onChange={() => onChange({ layout: lid })} />
              {l.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend className="mb-1 font-semibold">{t.horses}</legend>
        <div className="flex flex-wrap gap-2">
          {rules.options.horsesPerPlayer.map((n) => (
            <label key={n} className={`seg ${c.horsesPerPlayer === n ? 'seg-on' : ''}`}>
              <input type="radio" name={`${id}-horses`} className="sr-only" checked={c.horsesPerPlayer === n} onChange={() => onChange({ horsesPerPlayer: n })} />
              {n}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled}>
        <legend className="mb-1 font-semibold">{t.afterFirstFinish}</legend>
        <div className="flex flex-wrap gap-2">
          {(['stop', 'continue'] as const).map((v) => (
            <label key={v} className={`seg ${c.afterFirstFinish === v ? 'seg-on' : ''}`}>
              <input type="radio" name={`${id}-after`} className="sr-only" checked={c.afterFirstFinish === v} onChange={() => onChange({ afterFirstFinish: v })} />
              {t[v]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-3">
        <input type="checkbox" className="h-5 w-5" disabled={disabled} checked={c.exactFinish} onChange={(e) => onChange({ exactFinish: e.target.checked })} />
        {t.exactFinish}
      </label>
      <label className="flex items-center gap-3">
        <input type="checkbox" className="h-5 w-5" disabled={disabled} checked={c.startFromStable} onChange={(e) => onChange({ startFromStable: e.target.checked })} />
        {t.startFromStable}
      </label>
      {showGuess && (
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5" disabled={disabled} checked={c.guessAlong} onChange={(e) => onChange({ guessAlong: e.target.checked })} />
          {site.online.guessAlong}
        </label>
      )}
    </div>
  )
}
