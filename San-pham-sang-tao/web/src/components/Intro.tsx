import { isTodo } from '../lib/data'
import { site } from '../lib/site'
import QuoteBlock from './ui/QuoteBlock'
import Todo from './ui/Todo'

export default function Intro() {
  const { intro } = site
  return (
    <section aria-label={intro.ariaLabel} className="px-4 pb-16">
      <div className="mx-auto max-w-3xl border-y border-line py-10">
        <QuoteBlock quote={intro.quote} size="lg" className="text-center" />
        <div className="mx-auto mt-6 max-w-xl">
          {isTodo(intro.paragraph) ? <Todo note={intro.todoNote} /> : <p>{intro.paragraph}</p>}
        </div>
      </div>
    </section>
  )
}
