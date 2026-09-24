import { team } from '../lib/data'
import { site } from '../lib/site'

/** Nhóm thực hiện (mục 3, §8). Chỉ hiện khi team.json có thành viên. */
export default function Team() {
  return (
    <section id="nhom" aria-labelledby="team-title" className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 id="team-title" className="text-3xl font-bold sm:text-4xl">
          {site.team.title}
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {team.members.map((m) => (
            <li key={m.name} className="rounded-sm border border-line bg-card px-4 py-3">
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-ink-soft">{m.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
