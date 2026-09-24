import { useState } from 'react'
import { mindmap } from '../lib/data'
import { PILLAR_BORDER, PILLAR_CHIP } from '../lib/pillarStyles'
import { site } from '../lib/site'
import type { PillarId } from '../types'
import Todo from './ui/Todo'

/** Tóm tắt 3 trụ cột (mục 2) dạng cây mở/đóng được. */
export default function MindMap() {
  const ui = site.mindmap
  const [open, setOpen] = useState<Set<PillarId>>(new Set())
  const allOpen = open.size === mindmap.pillars.length

  const toggle = (id: PillarId) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <section id="so-do" aria-labelledby="mindmap-title" className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="mindmap-title" className="text-3xl font-bold sm:text-4xl">
            {ui.title}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(mindmap.pillars.map((p) => p.id)))}
            className="rounded px-2 py-1 text-sm font-semibold hover:bg-line"
          >
            {allOpen ? ui.collapseAll : ui.expandAll}
          </button>
        </div>

        <div className="mt-8 inline-block rounded-sm bg-ink px-4 py-2 font-serif text-lg font-bold text-paper">
          {mindmap.root}
        </div>

        <ul className="mt-2 ml-4 border-l-2 border-line">
          {mindmap.pillars.map((p) => {
            const isOpen = open.has(p.id)
            const panelId = `mindmap-${p.id}`
            return (
              <li key={p.id} className="relative pt-4 pl-6 before:absolute before:top-9 before:left-0 before:w-5 before:border-t-2 before:border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(p.id)}
                  className={`flex w-full items-center gap-3 rounded-sm px-4 py-3 text-left font-serif text-lg font-bold ${PILLAR_CHIP[p.id]}`}
                >
                  <span aria-hidden="true" className="w-4 text-center">
                    {isOpen ? '−' : '+'}
                  </span>
                  <span className="flex-1">{p.name}</span>
                  <span className="text-sm font-normal opacity-80">{p.items.length}</span>
                </button>
                <ul id={panelId} hidden={!isOpen} className={`mt-2 ml-5 space-y-3 border-l-2 pl-5 ${PILLAR_BORDER[p.id]}`}>
                  {p.items.map((it) => (
                    <li key={it.title} className="rounded-sm border border-line bg-card px-4 py-3">
                      <p className="font-semibold">{it.title}</p>
                      <p className="mt-1 text-sm">{it.text}</p>
                    </li>
                  ))}
                  {p.todo && (
                    <li>
                      <Todo note={p.todo.replace(/^TODO:?\s*/, '')} />
                    </li>
                  )}
                </ul>
              </li>
            )
          })}
        </ul>
        <p className="mt-6 text-xs text-ink-soft">{mindmap.source}</p>
      </div>
    </section>
  )
}
