// Màn kết thúc (mục 10, 12.6): thứ tự về đích hoặc xếp hạng theo khoảng cách (người dẫn đầu
// được tôn vinh như người thắng), thống kê, ôn lại câu sai, thông điệp kết, kỷ lục cá nhân.
import { Crown, Trophy } from 'lucide-react'
import type { GameData, GameState } from '../engine/types'
import type { RecordResult } from '../game/local'
import { site, tokens } from '../lib/gameData'
import { fill } from '../lib/text'
import { SymbolShape } from './icons'

export function EndPanel({ data, state, record, onAgain, onHome }: { data: GameData; state: GameState; record: RecordResult | null; onAgain: () => void; onHome: () => void }) {
  const t = site.end
  const end = state.ended!
  const ranking = end.ranking
  const byId = new Map(state.players.map((p) => [p.id, p]))
  const top = ranking.filter((r) => r.rank === 1)
  const leader = byId.get(ranking[0].playerId)!
  const headline =
    end.reason === 'time'
      ? top.length > 1
        ? t.byTimeTie
        : fill(t.byTime, { name: leader.name })
      : end.reason === 'host'
        ? t.byHost
        : fill(state.players.length === 1 ? t.bySolo : t.byFinish, { name: leader.name })
  const humans = state.players.filter((p) => !p.isBot)
  return (
    <div className="flex flex-col gap-5">
      <header className="text-center">
        <Crown className="mx-auto text-gold" size={44} aria-hidden="true" />
        <h1 className="font-serif text-2xl font-bold sm:text-3xl" aria-live="polite">
          {headline}
        </h1>
        <p className="mt-2 font-serif text-lg italic">“{site.message}”</p>
      </header>

      {record && (
        <section className="rounded-2xl border-2 border-gold bg-surface p-4 text-center">
          <p className="text-sm font-semibold text-ink-soft">{t.solo}</p>
          {record.turns !== null ? (
            <>
              <p className="text-lg font-bold">{fill(t.turnsUsed, { n: record.turns })}</p>
              <p className={record.isNew ? 'font-bold text-ok' : ''}>{record.isNew ? fill(t.newRecord, { n: record.turns }) : record.previous !== null ? fill(t.record, { n: record.previous }) : ''}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold">{fill(t.notFinished, { n: ranking[0].remaining })}</p>
              {record.previous !== null && <p>{fill(t.record, { n: record.previous })}</p>}
            </>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-bold">{t.ranking}</h2>
        <ol className="flex flex-col gap-2">
          {ranking.map((r) => {
            const p = byId.get(r.playerId)!
            const tok = tokens.colors[p.color]
            return (
              <li key={r.playerId} className={`flex items-center gap-3 rounded-2xl border-2 bg-surface p-3 ${r.rank === 1 ? 'border-gold' : 'border-line'}`}>
                <span className="w-10 text-center text-lg font-bold">{r.rank === 1 ? <Trophy className="mx-auto text-gold" aria-label={fill(t.rankN, { n: 1 })} /> : `#${r.rank}`}</span>
                <svg width={28} height={28} viewBox="-14 -14 28 28" aria-hidden="true">
                  <circle r={13} fill={tok.color} />
                  <SymbolShape symbol={tok.symbol} s={13} fill="#fff" />
                </svg>
                <span className="flex-1 font-semibold">
                  {p.name}
                  {r.rank === 1 && <span className="ml-2 text-sm text-ink-soft">{r.finished ? t.winner : t.leader}</span>}
                </span>
                <span className="text-sm text-ink-soft">{r.finished ? t.finishedAt : fill(t.remaining, { n: r.remaining })}</span>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="overflow-x-auto">
        <h2 className="mb-2 text-lg font-bold">{t.stats}</h2>
        <table className="w-full min-w-[22rem] text-left text-sm">
          <thead>
            <tr className="text-ink-soft">
              <th className="py-1 pr-2 font-semibold"> </th>
              <th className="py-1 pr-2 font-semibold">{t.correct}</th>
              <th className="py-1 pr-2 font-semibold">{t.wrong}</th>
              <th className="py-1 pr-2 font-semibold">{t.powerups}</th>
              <th className="py-1 pr-2 font-semibold">{t.traps}</th>
              {state.config.guessAlong && <th className="py-1 font-semibold">{t.guess}</th>}
            </tr>
          </thead>
          <tbody>
            {ranking.map((r) => {
              const p = byId.get(r.playerId)!
              return (
                <tr key={p.id} className="border-t border-line">
                  <th className="py-1.5 pr-2 font-semibold">{p.name}</th>
                  <td className="py-1.5 pr-2 tabular-nums">{p.stats.correct}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{p.stats.wrong}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{p.stats.powerupsUsed}</td>
                  <td className="py-1.5 pr-2 tabular-nums">{p.stats.trapsHit}</td>
                  {state.config.guessAlong && (
                    <td className="py-1.5 tabular-nums">
                      {p.stats.guessCorrect}/{p.stats.guessTotal}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">{t.review}</h2>
        {humans.every((p) => p.stats.wrongIds.length === 0) && <p className="text-ink-soft">{t.noWrong}</p>}
        {humans
          .filter((p) => p.stats.wrongIds.length > 0)
          .map((p) => (
            <div key={p.id} className="mb-3">
              {humans.length > 1 && <h3 className="mb-1 font-semibold">{fill(t.reviewOf, { name: p.name })}</h3>}
              <ul className="flex flex-col gap-2">
                {p.stats.wrongIds.map((qid) => {
                  const q = data.questionById.get(qid)
                  if (!q) return null
                  return (
                    <li key={qid} className="rounded-2xl border border-line bg-surface p-3">
                      <p className="font-semibold">{q.question}</p>
                      <p className="mt-1 text-ok">{fill(t.reviewAnswer, { answer: q.answers[q.correct] })}</p>
                      <p className="mt-1 text-sm leading-relaxed">{q.explanation}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {site.game.question.source}: {q.source.ref}
                        {q.test ? ` · ${site.testLabel}` : ''}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-primary flex-1" onClick={onAgain}>
          {t.playAgain}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onHome}>
          {t.home}
        </button>
      </div>
    </div>
  )
}
