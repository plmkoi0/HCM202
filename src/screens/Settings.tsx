// Cài đặt (mục 12.1): âm thanh, hiệu ứng chuyển động, giao diện sáng/tối, cỡ chữ, toàn màn hình,
// xóa dữ liệu trên máy. Dùng ở màn riêng và trong cửa sổ Menu của ván.
import { Volume2 } from 'lucide-react'
import { useState } from 'react'
import { canFullscreen, toggleFullscreen } from '../game/useShortcuts'
import { clearSave, RECORDS_KEY, SETUP_KEY, SEEN_KEY } from '../game/local'
import { clearProfile, clearSession } from '../online/session'
import { site } from '../lib/gameData'
import { setSettings, useSettings, type Settings as S } from '../lib/settings'
import { playSound } from '../lib/sound'
import { remove } from '../lib/storage'
import { fill } from '../lib/text'

function Choice<K extends keyof S>({ name, legend, value, options, hint }: { name: K; legend: string; value: S[K]; options: [S[K], string][]; hint?: string }) {
  return (
    <fieldset>
      <legend className="mb-1 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, label]) => (
          <label key={String(v)} className={`seg ${value === v ? 'seg-on' : ''}`}>
            <input type="radio" name={`settings-${name}`} className="sr-only" checked={value === v} onChange={() => setSettings({ [name]: v } as Partial<S>)} />
            {label}
          </label>
        ))}
      </div>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    </fieldset>
  )
}

/** Xóa dữ liệu trên máy (giữ cài đặt): ván lưu, thiết lập, kỷ lục, biệt danh, phiên phòng */
export function clearLocalData(): void {
  clearSave()
  // review.v1: Sổ ôn tập cũ (đã bỏ cùng Kho câu hỏi) — vẫn xóa nếu máy còn giữ
  for (const k of [SEEN_KEY, SETUP_KEY, RECORDS_KEY, 'review.v1']) remove(k)
  clearSession()
  clearProfile()
}

export function SettingsContent({ onCleared, allowClear = true }: { onCleared?: () => void; allowClear?: boolean }) {
  const t = site.settings
  const s = useSettings()
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-1 font-semibold">{t.sound}</legend>
        <div className="flex flex-wrap items-center gap-2">
          {([
            [true, t.soundOn],
            [false, t.soundOff],
          ] as const).map(([v, label]) => (
            <label key={String(v)} className={`seg ${s.sound === v ? 'seg-on' : ''}`}>
              <input
                type="radio"
                name="settings-sound"
                className="sr-only"
                checked={s.sound === v}
                onChange={() => {
                  setSettings({ sound: v })
                  if (v) playSound('tap')
                }}
              />
              {label}
            </label>
          ))}
          <button type="button" className="btn-secondary" disabled={!s.sound} onClick={() => playSound('correct')}>
            <Volume2 size={18} aria-hidden="true" /> {t.soundTest}
          </button>
        </div>
      </fieldset>
      <Choice
        name="motion"
        legend={t.motion}
        value={s.motion}
        options={[
          ['system', t.motionSystem],
          ['reduce', t.motionReduce],
          ['full', t.motionFull],
        ]}
        hint={t.motionHint}
      />
      <Choice
        name="theme"
        legend={t.theme}
        value={s.theme}
        options={[
          ['system', t.themeSystem],
          ['light', t.themeLight],
          ['dark', t.themeDark],
        ]}
      />
      <Choice
        name="textSize"
        legend={t.textSize}
        value={s.textSize}
        options={[
          ['normal', t.textNormal],
          ['large', t.textLarge],
        ]}
      />
      {canFullscreen() && (
        <div>
          <p className="mb-1 font-semibold">{t.fullscreen}</p>
          <button type="button" className="btn-secondary" onClick={toggleFullscreen}>
            {t.fullscreenButton}
          </button>
        </div>
      )}
      {allowClear && (
        <section className="flex flex-col gap-2 rounded-2xl border border-line p-3">
          <h2 className="font-semibold">{t.data}</h2>
          <p className="text-sm leading-relaxed text-ink-soft">{t.dataNote}</p>
          {!confirm && (
            <button type="button" className="btn-secondary self-start" onClick={() => setConfirm(true)}>
              {t.clear}
            </button>
          )}
          {confirm && (
            <div className="flex flex-col gap-2" role="group" aria-label={t.clear}>
              <p className="font-semibold">{t.clearConfirm}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={() => {
                    clearLocalData()
                    setConfirm(false)
                    setDone(true)
                    onCleared?.()
                  }}
                >
                  {t.clearYes}
                </button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setConfirm(false)}>
                  {site.common.cancel}
                </button>
              </div>
            </div>
          )}
          {done && (
            <p role="status" className="text-sm font-semibold text-ok">
              {t.cleared}
            </p>
          )}
        </section>
      )}
      <p className="text-xs text-ink-soft">{fill(t.version, { kind: __OFFLINE__ ? t.offline : t.online })}</p>
    </div>
  )
}

export function Settings({ onBack }: { onBack: () => void }) {
  const t = site.settings
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
      <header>
        <button type="button" className="btn-link" onClick={onBack}>
          ← {t.back}
        </button>
        <h1 className="mt-2 font-serif text-3xl font-bold">{t.title}</h1>
      </header>
      <section className="card">
        <SettingsContent />
      </section>
    </main>
  )
}
