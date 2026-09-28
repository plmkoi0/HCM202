import { sources } from '../lib/data'
import { sortedReferences, todoReferences } from '../lib/sources'
import { site } from '../lib/site'
import ReferenceText from './ui/Reference'
import Todo from './ui/Todo'

/** Nguồn tham khảo theo APA7 (mục 9). */
export default function Sources() {
  const ui = site.sources
  return (
    <section id="nguon" aria-labelledby="sources-title" className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 id="sources-title" className="text-3xl font-bold sm:text-4xl">
          {ui.title}
        </h2>
        <ul className="mt-8 space-y-3">
          {sortedReferences.map((r) => (
            <li key={r.id} className="pl-8 -indent-8">
              <ReferenceText r={r} />
            </li>
          ))}
          {todoReferences.map((r) => (
            <li key={r.id}>
              <Todo note={r.text?.replace(/^TODO[^:]*:\s*/, '')} />
            </li>
          ))}
          {sources.todo.map((t) => (
            <li key={t}>
              <Todo note={t.replace(/^TODO:?\s*/, '')} />
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-soft">
          {ui.citeNote} {sources.citeFormat}
        </p>
      </div>
    </section>
  )
}
