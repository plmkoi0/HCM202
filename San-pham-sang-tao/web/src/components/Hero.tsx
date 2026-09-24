import { site } from '../lib/site'

export default function Hero() {
  const { hero } = site
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-ink-soft uppercase">{hero.eyebrow}</p>

        <h1 id="hero-title" className="stamp mt-8 inline-block border-4 border-double border-son px-6 py-4 text-son-text sm:px-10 sm:py-6">
          {hero.stampLines.map((line) => (
            <span key={line} className="block text-4xl font-extrabold tracking-tight uppercase sm:text-6xl">
              {line}
            </span>
          ))}
        </h1>

        <p className="mt-10 font-serif text-xl italic sm:text-2xl">{hero.subtitle}</p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <a
            href="#bao-tang"
            className="rounded-sm bg-son px-6 py-3 font-semibold text-on-son shadow-sm transition hover:brightness-110"
          >
            {hero.ctaMuseum}
          </a>
          <a
            href="#quiz"
            className="rounded-sm border-2 border-ink px-6 py-3 font-semibold transition hover:bg-ink hover:text-paper"
          >
            {hero.ctaQuiz}
          </a>
        </div>
      </div>
    </section>
  )
}
