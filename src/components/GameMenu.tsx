// Nút trên thanh đầu màn chơi: tắt/bật tiếng (M) và Menu (Luật chơi · Cài đặt · toàn màn hình).
// Không có Kho câu hỏi (đã bỏ 05/10/2026 để tránh gian lận).
import { Maximize, Menu, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { canFullscreen, toggleFullscreen, toggleSound } from '../game/useShortcuts'
import { site } from '../lib/gameData'
import { useSettings } from '../lib/settings'
import { RulesContent } from '../screens/Rules'
import { SettingsContent } from '../screens/Settings'
import { Sheet } from './Sheet'

export function SoundButton() {
  const { sound } = useSettings()
  const t = site.game
  const label = sound ? t.soundOn : t.soundOff
  return (
    <button type="button" className="btn-icon" onClick={() => toggleSound()} aria-label={label} title={label} aria-pressed={!sound}>
      {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  )
}

export function MenuButton({ onOpen }: { onOpen: () => void }) {
  const t = site.game
  return (
    <button type="button" className="btn-icon" onClick={onOpen} aria-label={t.menu} title={t.menu} aria-haspopup="dialog">
      <Menu size={20} />
    </button>
  )
}

export function GameMenu({ onClose }: { onClose: () => void }) {
  const t = site.game
  const [tab, setTab] = useState<'rules' | 'settings'>('rules')
  return (
    <Sheet title={t.menu} labelledBy="menu-title" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label={t.menu}>
            {(
              [
                ['rules', t.rules],
                ['settings', t.settings],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="tab" id={`menu-tab-${id}`} aria-selected={tab === id} aria-controls="menu-panel" className={`seg ${tab === id ? 'seg-on' : ''}`} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>
          {canFullscreen() && (
            <button type="button" className="seg ml-auto" onClick={toggleFullscreen}>
              <Maximize size={16} aria-hidden="true" className="mr-1" /> {t.fullscreen}
            </button>
          )}
        </div>
        <div id="menu-panel" role="tabpanel" aria-labelledby={`menu-tab-${tab}`}>
          {tab === 'rules' ? <RulesContent /> : <SettingsContent allowClear={false} />}
        </div>
        <button type="button" className="btn-primary" data-autofocus onClick={onClose}>
          {site.common.close}
        </button>
      </div>
    </Sheet>
  )
}
