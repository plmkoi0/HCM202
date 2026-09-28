import { team } from '../lib/data'
import { site } from '../lib/site'

const LINKS = [
  { href: '#bao-tang', label: site.nav.museum },
  { href: '#quiz', label: site.nav.quiz },
  { href: '#nguon', label: site.nav.sources },
  { href: '#nhom', label: site.nav.team },
].filter((l) => l.href !== '#nhom' || team.members.length > 0)

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <nav aria-label={site.nav.ariaLabel} className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <a href="#top" className="flex shrink-0 items-center gap-2 font-serif font-bold text-son-text">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="9.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M16 10l1.8 3.7 4 .6-2.9 2.8.7 4L16 19.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="currentColor" />
          </svg>
          <span className="sr-only sm:not-sr-only">{site.nav.brand}</span>
        </a>
        <ul className="flex items-center gap-0.5 text-sm font-medium sm:gap-2">
          {LINKS.map((l, i) => (
            <li key={l.href} className="flex items-center">
              {i > 0 && (
                <span aria-hidden="true" className="px-0.5 text-ink-soft">
                  ·
                </span>
              )}
              <a href={l.href} className="rounded px-1.5 py-2 hover:text-son-text">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
