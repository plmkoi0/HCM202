import { site } from '../lib/site'

export default function Bridge() {
  const { bridge } = site
  return (
    <section aria-label="Cầu nối" className="px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-serif text-2xl leading-snug sm:text-3xl">{bridge.text}</p>
        <a
          href="#quiz"
          className="mt-8 inline-block rounded-sm bg-son px-6 py-3 font-semibold text-on-son shadow-sm transition hover:brightness-110"
        >
          {bridge.cta} →
        </a>
      </div>
    </section>
  )
}
