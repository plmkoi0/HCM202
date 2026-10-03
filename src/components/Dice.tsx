// Xúc xắc SVG; lăn bằng CSS (tắt khi prefers-reduced-motion — xem index.css)
const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
}

export function Dice({ face, rolling, size = 64, label }: { face: number | null; rolling: boolean; size?: number; label: string }) {
  const f = face ?? 1
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={rolling ? 'dice-rolling' : undefined} role="img" aria-label={label}>
      <rect x={4} y={4} width={92} height={92} rx={20} fill="var(--surface)" stroke="var(--ink)" strokeWidth={5} />
      {face !== null && !rolling && PIPS[f].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="var(--ink)" />)}
      {(face === null || rolling) && <text x={50} y={64} fontSize={44} fontWeight={700} textAnchor="middle" fill="var(--ink-soft)">?</text>}
    </svg>
  )
}
