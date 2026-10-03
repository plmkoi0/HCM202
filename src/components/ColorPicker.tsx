// Chọn màu ngựa (6 màu, mỗi màu một ký hiệu — không chỉ dựa vào màu). Màu đã có người chọn thì mờ, không bấm được.
import { site, tokens } from '../lib/gameData'
import { SymbolShape } from './icons'

export function ColorPicker({ name, value, taken = [], onChange, legend }: { name: string; value: number; taken?: number[]; onChange: (c: number) => void; legend: string }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {tokens.colors.map((c, ci) => {
          const isTaken = taken.includes(ci) && ci !== value
          return (
            <label key={c.id} className={`color-pick ${value === ci ? 'color-pick-on' : ''} ${isTaken ? 'opacity-30' : ''}`} style={{ background: c.color }}>
              <input type="radio" name={name} className="sr-only" checked={value === ci} disabled={isTaken} onChange={() => onChange(ci)} />
              <svg width={22} height={22} viewBox="-11 -11 22 22" aria-hidden="true">
                <SymbolShape symbol={c.symbol} s={14} fill="#fff" />
              </svg>
              <span className="sr-only">
                {c.name} ({c.symbolLabel}){isTaken ? ` — ${site.online.colorTaken}` : ''}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
