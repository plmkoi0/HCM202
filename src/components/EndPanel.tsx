// Màn kết thúc (mục 10, 12.6): thứ tự về đích hoặc xếp hạng theo khoảng cách (người dẫn đầu
// được tôn vinh như người thắng), thống kê, ôn lại câu sai, thông điệp kết, kỷ lục cá nhân.
import { Crown, GraduationCap, Share2, Trophy } from 'lucide-react'
import { useState } from 'react'
import type { GameData, GameState } from '../engine/types'
import type { RecordResult } from '../game/local'
import { site, tokens } from '../lib/gameData'
import { fill } from '../lib/text'
import { ArtifactCard, findArtifact } from './ArtifactCard'
import { SymbolShape } from './icons'
import { PillarChip } from './PillarChip'
import { Practice } from './Practice'

/** Chia sẻ link game: Web Share nếu có, không thì sao chép (trình duyệt nhúng Zalo/Messenger — mục 16) */
async function shareGame(): Promise<'shared' | 'copied' | 'failed'> {
  const url = site.siteUrl
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: site.title, text: site.end.shareText, url })
      return 'shared'
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : '—')

export function EndPanel({
  data,
  state,
  record,
  onAgain,
  onHome,
  againLabel,
  againDisabled = false,
  note,
  reviewFor,
}: {
  data: GameData
  state: GameState
  record: RecordResult | null
  onAgain: () => void
  onHome: () => void
  /** chơi qua phòng: "Chơi lại (về phòng chờ)"; chỉ chủ phòng bấm được */
  againLabel?: string
  againDisabled?: boolean
  note?: string
  /** id người chơi được ôn câu sai (chơi qua phòng: chỉ mình); mặc định mọi người (không phải máy) */
  reviewFor?: string[]
}) {
  const [practice, setPractice] = useState<string[] | null>(null)
  const [artifact, setArtifact] = useState<string | null>(null)
  const [shareNote, setShareNote] = useState<string | null>(null)
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
  const humans = state.players.filter((p) => !p.isBot && (!reviewFor || reviewFor.includes(p.id)))
  const allWrong = [...new Set(humans.flatMap((p) => p.stats.wrongIds))].filter((id) => data.questionById.has(id))
  const statPlayers = state.players.filter((p) => !p.isBot || p.stats.correct + p.stats.wrong > 0)
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

      <section>
        <h2 id="end-stats" className="mb-2 text-lg font-bold">
          {t.stats}
        </h2>
        {/* bảng rộng hơn màn điện thoại thì cuộn ngang — vùng cuộn nhận tiêu điểm để dùng bàn phím */}
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="end-stats">
          <table className="w-full min-w-[20rem] text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-ink-soft">
                <th className="py-1 pr-2 font-semibold"> </th>
                <th className="py-1 pr-2 font-semibold">{t.correct}</th>
                <th className="py-1 pr-2 font-semibold">{t.wrong}</th>
                <th className="py-1 pr-2 font-semibold">{t.accuracy}</th>
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
                    <td className="py-1.5 pr-2 tabular-nums">{pct(p.stats.correct, p.stats.correct + p.stats.wrong)}</td>
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
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">{t.byPillar}</h2>
        <ul className="flex flex-col gap-3">
          {(humans.length > 0 ? humans : statPlayers).map((p) => (
            <li key={p.id} className="flex flex-col gap-1.5">
              {(humans.length !== 1 || state.players.length > 1) && <span className="font-semibold">{p.name}</span>}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {data.pillars.map((pl) => {
                  const [c, n] = p.stats.byPillar?.[pl.id] ?? [0, 0]
                  return (
                    <span key={pl.id} className="flex items-center gap-2 text-sm" data-pillar-stat={pl.id}>
                      <PillarChip pillar={pl} />
                      <span className="tabular-nums">{n > 0 ? `${fill(t.pillarScore, { correct: c, total: n })} (${pct(c, n)})` : t.noAnswers}</span>
                    </span>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">{reviewFor ? t.reviewMine : t.review}</h2>
        {humans.every((p) => p.stats.wrongIds.length === 0) && <p className="text-ink-soft">{t.noWrong}</p>}
        {allWrong.length > 0 && (
          <div className="mb-3 flex flex-col gap-1">
            <button type="button" className="btn-primary self-start" onClick={() => setPractice(allWrong)}>
              <GraduationCap size={18} aria-hidden="true" /> {t.practiceWrong}
            </button>
            <p className="text-sm text-ink-soft">{t.savedToReview}</p>
          </div>
        )}
        {humans
          .filter((p) => p.stats.wrongIds.length > 0)
          .map((p) => (
            <div key={p.id} className="mb-3">
              {humans.length > 1 && <h3 className="mb-1 font-semibold">{fill(t.reviewOf, { name: p.name })}</h3>}
              <ul className="flex flex-col gap-2">
                {p.stats.wrongIds.map((qid) => {
                  const q = data.questionById.get(qid)
                  if (!q) return null
                  const art = findArtifact(q.artifact)
                  return (
                    <li key={qid} className="rounded-2xl border border-line bg-surface p-3">
                      <p className="font-semibold">{q.question}</p>
                      <p className="mt-1 text-ok">{fill(t.reviewAnswer, { answer: q.answers[q.correct] })}</p>
                      <p className="mt-1 text-sm leading-relaxed">{q.explanation}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {site.game.question.source}: {q.source.ref}
                        {q.test ? ` · ${site.testLabel}` : ''}
                      </p>
                      {art && (
                        <button type="button" className="btn-chip mt-2" onClick={() => setArtifact(art.id)}>
                          {site.game.question.artifact}: {art.id} · {art.title}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
      </section>

      {note && <p className="text-center text-ink-soft">{note}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-primary flex-1" onClick={onAgain} disabled={againDisabled}>
          {againLabel ?? t.playAgain}
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={onHome}>
          {t.home}
        </button>
      </div>
      <button
        type="button"
        className="btn-link inline-flex items-center gap-1.5 self-center"
        onClick={() => void shareGame().then((r) => setShareNote(r === 'copied' ? t.copied : r === 'failed' ? site.siteUrl : null))}
      >
        <Share2 size={16} aria-hidden="true" /> {t.share}
      </button>
      <p role="status" className={shareNote ? 'text-center text-sm' : 'sr-only'}>
        {shareNote}
      </p>
      {practice && <Practice ids={practice} onClose={() => setPractice(null)} onArtifact={setArtifact} />}
      {artifact && <ArtifactCard id={artifact} onClose={() => setArtifact(null)} />}
    </div>
  )
}
