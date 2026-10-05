// Cửa sổ câu hỏi (mục 8, 12.5): nhãn "Độ khó n", đồng hồ, nút 50:50 / Đổi câu nếu có; sau khi
// chốt chỉ hiện Đúng / Sai và đáp án đúng (bản 1.6). Đáp án trộn theo state.turn.question.order.
import { Check, X } from 'lucide-react'
import { revealMsOf } from '../engine/reducer'
import type { GameData, GameState, PowerupId } from '../engine/types'
import { site } from '../lib/gameData'
import { fill } from '../lib/text'
import { Countdown } from './Countdown'
import { PlayerChip } from './PlayerChip'
import { POWERUP_ICONS } from './icons'
import { Sheet } from './Sheet'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  data: GameData
  state: GameState
  playerName: string
  /** người đến lượt là người (không phải máy) và đang ở pha trả lời */
  canAnswer: boolean
  bag: PowerupId[]
  onAnswer: (choice: number) => void
  onPowerup: (id: PowerupId) => void
  onContinue: () => void
  /** lúc tự sang lượt sau khi hiện đáp án đúng (đồng hồ trên nút Tiếp tục) */
  autoAt: number | null
  /** chơi qua phòng: chỉ người đến lượt bấm Tiếp tục */
  canContinue?: boolean
  /** ghi chú dưới đáp án (vd. Đoán cùng) */
  note?: string
}

export function QuestionPanel({ data, state, playerName, canAnswer, bag, onAnswer, onPowerup, onContinue, autoAt, canContinue = true, note }: Props) {
  const t = site.game.question
  const aq = state.turn.question
  if (!aq) return null
  const q = data.questionById.get(aq.id)
  if (!q) return null
  const outcome = state.turn.outcome?.kind === 'answered' ? state.turn.outcome : null
  const revealed = state.phase === 'reveal' && outcome !== null
  const remaining = q.answers.length - aq.eliminated.length
  const hasFifty = canAnswer && bag.includes('fiftyFifty') && !aq.fiftyFiftyUsed
  const canFifty = hasFifty && remaining > 2
  const canSwap = canAnswer && bag.includes('swap') && !aq.swapUsed
  const tone = revealed ? (outcome.correct ? 'good' : 'bad') : 'default'
  const FiftyIcon = POWERUP_ICONS.fiftyFifty
  const SwapIcon = POWERUP_ICONS.swap
  const owner = state.players.find((p) => p.id === state.turn.playerId)
  const result = revealed ? `${playerName}: ${outcome.correct ? t.correct : outcome.timedOut ? t.timeout : t.wrong} — ${outcome.correct ? (outcome.finished ? t.reachedFinish : fill(t.moveOn, { n: outcome.moved })) : t.stay}` : ''

  return (
    <Sheet labelledBy="q-title" tone={tone}>
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* vùng thông báo luôn có sẵn để trình đọc màn hình đọc kết quả khi vừa chốt */}
        <p className="sr-only" aria-live="polite">
          {result}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {owner && <PlayerChip player={owner} text={fill(t.owner, { name: playerName })} />}
          <span className="rounded-full bg-line px-2.5 py-0.5 font-semibold">{fill(t.difficulty, { n: q.difficulty })}</span>
          {aq.isFinish && <span className="rounded-full bg-gold px-2.5 py-0.5 font-bold text-on-gold">{t.finish}</span>}
          {q.test && <span className="rounded-full border border-ink-soft px-2 py-0.5 text-ink-soft">{site.testLabel}</span>}
        </div>
        <h2 id="q-title" className="text-base font-semibold leading-snug sm:text-xl">
          {q.question}
        </h2>
        {!revealed && (
          <Countdown deadline={state.deadline} total={state.config.timers.answerMs} label={(s) => fill(t.timeLeft, { s })} />
        )}
        {!revealed && !canAnswer && <p className="text-ink-soft" aria-live="polite">{fill(t.botAnswering, { name: playerName })}</p>}
        {!revealed && note && <p className="text-sm font-semibold text-accent-text">{note}</p>}
        {revealed && (
          <div className="flex flex-col gap-3">
            <p className={`text-xl font-bold ${outcome.correct ? 'text-ok' : 'text-bad'}`}>
              <span className="text-ink">{playerName}:</span> {outcome.correct ? t.correct : outcome.timedOut ? t.timeout : t.wrong}{' '}
              <span className="font-semibold text-ink">
                — {outcome.correct ? (outcome.finished ? t.reachedFinish : fill(t.moveOn, { n: outcome.moved })) : t.stay}
              </span>
            </p>
            {/* bản 1.6: chỉ Đúng / Sai và đáp án đúng; đặt trên danh sách đáp án để điện thoại thấy ngay không cần cuộn */}
            <p className="rounded-2xl bg-bg p-3" data-correct-answer>
              <span className="font-bold text-ink-soft">{t.correctAnswer}:</span> {q.answers[outcome.correctIndex]}
            </p>
            <Countdown deadline={autoAt} total={revealMsOf(state, state.config.timers)} label={(s) => fill(site.game.autoContinueIn, { s })} />
            {canContinue && (
              <button type="button" className="btn-primary" data-autofocus onClick={onContinue}>
                {site.game.continue}
              </button>
            )}
          </div>
        )}
        <div role="group" aria-label={t.answersLabel} className="flex flex-col gap-2">
          {aq.order.map((orig, pos) => {
            const eliminated = aq.eliminated.includes(orig)
            const isCorrect = revealed && orig === outcome.correctIndex
            const isChosen = revealed && orig === outcome.chosen
            const cls = isCorrect ? 'answer answer-correct' : isChosen ? 'answer answer-wrong' : 'answer'
            return (
              <button
                key={orig}
                type="button"
                className={cls}
                disabled={!canAnswer || eliminated || revealed}
                aria-disabled={!canAnswer || eliminated || revealed}
                onClick={() => onAnswer(orig)}
                data-answer={pos}
              >
                <span className="answer-letter" aria-hidden="true">
                  {LETTERS[pos]}
                </span>
                <span className={`flex-1 text-left ${eliminated ? 'line-through opacity-50' : ''}`}>{q.answers[orig]}</span>
                {isCorrect && (
                  <span className="flex items-center gap-1 text-sm font-bold text-ok">
                    <Check size={18} aria-hidden="true" /> <span className="sr-only sm:not-sr-only">{t.correctAnswer}</span>
                  </span>
                )}
                {isChosen && !isCorrect && (
                  <span className="flex items-center gap-1 text-sm font-bold text-bad">
                    <X size={18} aria-hidden="true" /> <span className="sr-only sm:not-sr-only">{t.chosen}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {!revealed && canAnswer && (hasFifty || canSwap) && (
          <div className="flex flex-wrap items-center gap-2">
            {hasFifty && (
              <button
                type="button"
                className="btn-secondary"
                disabled={!canFifty}
                aria-describedby={canFifty ? undefined : 'fifty-note'}
                onClick={() => onPowerup('fiftyFifty')}
              >
                <FiftyIcon size={18} aria-hidden="true" /> {t.fiftyFifty}
              </button>
            )}
            {canSwap && (
              <button type="button" className="btn-secondary" onClick={() => onPowerup('swap')}>
                <SwapIcon size={18} aria-hidden="true" /> {t.swap}
              </button>
            )}
            {hasFifty && !canFifty && (
              <span id="fifty-note" className="text-sm text-ink-soft">
                {site.game.fiftyFiftyUnavailable}
              </span>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
