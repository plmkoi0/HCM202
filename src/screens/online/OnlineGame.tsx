// Ván chơi qua phòng (mục 12.4–12.6): như "Chơi trên một máy" nhưng mỗi máy chỉ điều khiển ngựa của
// mình; hạn theo giờ server (đổi sang giờ máy); trạng thái kết nối; Đoán cùng; chơi lại về phòng chờ.
import { LogOut, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ClientAction, StateView } from '../../../server/types'
import { Board, BoardLegend } from '../../components/Board'
import { Confetti } from '../../components/Confetti'
import { GameMenu, MenuButton, SoundButton } from '../../components/GameMenu'
import { Countdown } from '../../components/Countdown'
import { Dice } from '../../components/Dice'
import { EndPanel } from '../../components/EndPanel'
import { POWERUP_ICONS, SymbolShape } from '../../components/icons'
import { PlayerStrip } from '../../components/PlayerStrip'
import { QuestionPanel } from '../../components/QuestionPanel'
import { ChooseHorsePanel, DiscardPanel, OutcomePanel } from '../../components/TurnPanels'
import { geometry } from '../../engine/board'
import { currentPlayer, movableHorses } from '../../engine/reducer'
import type { GameState, PowerupId } from '../../engine/types'
import { useBoardAnimation } from '../../game/useBoardAnimation'
import { useShortcuts } from '../../game/useShortcuts'
import { recentLog } from '../../lib/eventText'
import { gameData, site, tokens } from '../../lib/gameData'
import { useNow, useReducedMotion } from '../../lib/hooks'
import { playSound } from '../../lib/sound'
import { clock, fill } from '../../lib/text'
import type { ConnectionMode } from '../../net/connection'

const data = gameData
type Act = (a: ClientAction) => Promise<{ ok: true } | { ok: false; error: string; message?: string }>

/** đổi mốc giờ server sang giờ máy để các thành phần đếm ngược dùng Date.now() */
function localGame(v: StateView, offset: number): GameState {
  const g = v.game!
  const sh = (x: number | null) => (x === null ? null : x - offset)
  return { ...g, seed: 0, rng: 0, deadline: sh(g.deadline), endsAt: sh(g.endsAt), startedAt: g.startedAt - offset } as GameState
}

export function ConnectionBadge({ mode }: { mode: ConnectionMode }) {
  const t = site.online
  const [label, cls] =
    mode === 'ws' ? [t.statusWs, 'text-ok'] : mode === 'poll' ? [t.statusPoll, 'text-accent-text'] : mode === 'offline' ? [t.statusOffline, 'text-bad'] : [t.statusConnecting, 'text-ink-soft']
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${cls}`} role="status" data-conn={mode}>
      {mode === 'offline' ? <WifiOff size={16} aria-hidden="true" /> : <Wifi size={16} aria-hidden="true" />}
      {label}
    </span>
  )
}

function TimeLeft({ endsAt }: { endsAt: number | null }) {
  const now = useNow(500)
  const t = site.game
  if (endsAt === null) return <span className="text-sm text-ink-soft">{t.noLimit}</span>
  const left = endsAt - now
  return <span className={`whitespace-nowrap text-sm font-semibold tabular-nums ${left <= 60_000 ? 'text-bad' : ''}`}>{left > 0 ? fill(t.timeLeft, { time: clock(left) }) : t.timeUp}</span>
}

export function OnlineGame({ view, offset, mode, act, onLeave, report }: { view: StateView; offset: number; mode: ConnectionMode; act: Act; onLeave: () => void; report: (msg: string) => void }) {
  const reduced = useReducedMotion()
  const state = useMemo(() => localGame(view, offset), [view, offset])
  const anim = useBoardAnimation(state, reduced)
  const [menu, setMenu] = useState(false)
  const t = site.game
  const me = view.you
  const isHost = view.room.hostId === me
  const ended = state.phase === 'ended'
  const cur = ended ? null : currentPlayer(state)
  const mine = cur !== null && cur.id === me
  const meP = state.players.find((p) => p.id === me)
  const geo = geometry(data, state.config.layout)

  const send = async (a: ClientAction) => {
    const r = await act(a)
    if (!r.ok && !['TOO_EARLY', 'WRONG_PHASE'].includes(r.error)) report((site.errors as Record<string, string>)[r.error] ?? r.message ?? r.error)
  }
  const movable = useMemo(() => {
    if (state.phase !== 'chooseHorse' || !cur) return []
    const r = state.turn.roll!
    return movableHorses(data, state, cur, r.face, r.value)
  }, [state, cur])

  // tới lượt mình → tiếng báo (sau khi diễn hoạt xong)
  const myRoll = mine && state.phase === 'roll' && !anim.busy
  useEffect(() => {
    if (myRoll && state.players.length > 1) playSound('turn')
  }, [myRoll, state.players.length])

  // phím tắt (mục 16)
  const aq = state.turn.question
  const answering = !ended && state.phase === 'question' && aq !== null && !anim.busy && (mine || (state.config.guessAlong && !!meP && !meP.isBot && state.turn.guesses[me] === undefined))
  const powerLabel = (id: PowerupId) => data.powerups.items.find((p) => p.id === id)?.label ?? id
  useShortcuts(
    {
      primary: () => {
        if (!mine || anim.busy) return
        if (state.phase === 'roll') void send({ type: 'ROLL' })
        else if (state.phase === 'reveal' && state.turn.outcome) void send({ type: 'NEXT_TURN' })
      },
      answer: (pos) => {
        if (answering) {
          const orig = aq!.order[pos]
          if (orig !== undefined && !aq!.eliminated.includes(orig)) void send(mine ? { type: 'ANSWER', choice: orig } : { type: 'GUESS', choice: orig })
        } else if (mine && state.phase === 'chooseHorse' && !anim.busy && movable.includes(pos)) void send({ type: 'CHOOSE_HORSE', horse: pos })
      },
      power: (slot) => {
        const item = meP?.bag[slot]
        if (!item || !mine || anim.busy) return
        const ok =
          (item === 'double' && state.phase === 'roll' && !state.turn.doubleArmed) ||
          (item === 'fiftyFifty' && answering && !aq!.fiftyFiftyUsed && data.questionById.get(aq!.id)!.answers.length - aq!.eliminated.length > 2) ||
          (item === 'swap' && answering && !aq!.swapUsed)
        if (ok) void send({ type: 'USE_POWERUP', powerup: item })
        else report(fill(t.cannotUseNow, { name: powerLabel(item) }))
      },
    },
    !menu,
  )
  const confetti = <Confetti burst={anim.burst} reduced={reduced} />

  if (ended && !anim.busy) {
    return (
      <>
        <main className="mx-auto w-full max-w-2xl px-4 py-6">
          <div className="mb-3 flex justify-end">
            <ConnectionBadge mode={mode} />
          </div>
          <EndPanel
            data={data}
            state={state}
            record={null}
            againLabel={site.online.rematch}
            againDisabled={!isHost}
            note={isHost ? undefined : site.online.waitRematch}
            onAgain={() => void send({ type: 'REMATCH' })}
            onHome={onLeave}
            reviewFor={[me]}
          />
        </main>
        {confetti}
      </>
    )
  }

  const target = !ended && cur && state.turn.target !== null && (state.phase === 'question' || state.phase === 'chooseHorse' || state.phase === 'reveal') ? { color: cur.color, step: state.turn.target } : null
  const log = recentLog(data, state, 6)
  const tok = cur ? tokens.colors[cur.color] : null
  const showQuestion = state.turn.question !== null && ((state.phase === 'question' && !anim.busy) || (state.phase === 'reveal' && state.turn.outcome?.kind === 'answered'))
  const showOutcome = state.phase === 'reveal' && state.turn.outcome !== null && state.turn.outcome.kind !== 'answered' && !anim.busy
  // Đoán cùng: người đang chờ (không phải máy) chọn đáp án để tự kiểm tra
  const canGuess = !mine && state.phase === 'question' && state.config.guessAlong && !!meP && !meP.isBot && state.turn.guesses[me] === undefined
  const guessed = state.config.guessAlong && state.phase === 'question' && state.turn.guesses[me] !== undefined
  const roll = state.turn.roll
  const DoubleIcon = POWERUP_ICONS.double
  const usePower = (p: PowerupId) => void send({ type: 'USE_POWERUP', powerup: p })

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-5 lg:px-6">
        <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate font-mono font-bold">{view.room.code}</p>
            <div className="flex items-center gap-3">
              <ConnectionBadge mode={mode} />
              <TimeLeft endsAt={state.endsAt} />
              <SoundButton />
              <MenuButton onOpen={() => setMenu(true)} />
              <button type="button" className="btn-icon" onClick={onLeave} aria-label={site.online.leave} title={site.online.leave}>
                <LogOut size={20} />
              </button>
            </div>
          </header>
          <div className="lg:hidden">
            <PlayerStrip data={data} state={state} />
          </div>
          <div className="board-light mx-auto w-full max-w-[44rem] rounded-3xl">
            <Board
              data={data}
              state={state}
              positions={anim.positions}
              target={target}
              currentPlayerId={cur?.id ?? null}
              selectable={mine && state.phase === 'chooseHorse' ? movable : undefined}
              onSelectHorse={(h) => void send({ type: 'CHOOSE_HORSE', horse: h })}
              reduced={reduced}
              labels={{
                board: fill(site.board.label, { n: geo.ringLength, h: geo.homeLength }),
                cell: Object.fromEntries(Object.entries(data.board.cellTypes).map(([k, v]) => [k, v.label])),
                finish: data.board.cellTypes.finish?.label ?? '',
                horseN: t.horseN,
              }}
            />
          </div>
          {/* điện thoại: chú thích nằm dưới khu điều khiển để nút Tung xúc xắc không phải cuộn */}
          <div className="mx-auto hidden w-full max-w-[44rem] lg:block">
            <BoardLegend data={data} />
          </div>
        </div>

        <aside className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
          <div className="hidden lg:block">
            <PlayerStrip data={data} state={state} />
          </div>
          {cur && tok && (
            <section className="card flex flex-col gap-3" style={{ borderColor: tok.color }}>
              <div className="flex items-center gap-3">
                <svg width={36} height={36} viewBox="-18 -18 36 36" aria-hidden="true">
                  <circle r={17} fill={tok.color} />
                  <SymbolShape symbol={tok.symbol} s={16} fill="#fff" />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold" aria-live="polite">
                    {mine ? site.online.yourTurn : fill(t.turnOf, { name: cur.name })}
                  </p>
                  <p className="text-sm text-ink-soft">{fill(t.turnNumber, { n: cur.stats.turns })}</p>
                </div>
                <Dice face={anim.dice.face} rolling={anim.dice.rolling} label={anim.dice.face ? String(anim.dice.value ?? anim.dice.face) : t.roll} />
              </div>
              {roll?.doubled && state.phase !== 'roll' && !anim.dice.rolling && (
                <p className="self-start rounded-full bg-gold px-3 py-0.5 text-sm font-bold text-on-gold">{fill(t.doubledRoll, { face: roll.face, value: roll.value })}</p>
              )}
              {state.phase === 'chooseHorse' && mine && !anim.busy && <ChooseHorsePanel data={data} state={state} movable={movable} onChoose={(h) => void send({ type: 'CHOOSE_HORSE', horse: h })} />}
              {state.phase === 'roll' && mine && !anim.busy && (
                <>
                  {(cur.bag.includes('double') || state.turn.doubleArmed) && (
                    <button type="button" className={`btn-secondary ${state.turn.doubleArmed ? 'ring-4 ring-gold' : ''}`} disabled={state.turn.doubleArmed} onClick={() => usePower('double')}>
                      <DoubleIcon size={18} aria-hidden="true" /> {state.turn.doubleArmed ? t.doubleArmed : t.doubleButton}
                    </button>
                  )}
                  <button type="button" className="btn-primary btn-big" onClick={() => void send({ type: 'ROLL' })} data-autofocus>
                    {t.roll} <kbd className="kbd kbd-hint">{t.kbdRoll}</kbd>
                  </button>
                  <Countdown deadline={state.deadline} total={state.config.timers.rollMs} label={(s) => fill(t.autoRollIn, { s })} />
                </>
              )}
              {state.phase === 'roll' && (!mine || anim.busy) && <p className="text-ink-soft">{anim.dice.rolling ? t.rolling : cur.isBot ? fill(t.botTurn, { name: cur.name }) : fill(site.online.waitingFor, { name: cur.name })}</p>}
              {meP && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{t.bag}:</span>
                  {meP.bag.length === 0 && <span className="text-ink-soft">{t.bagEmpty}</span>}
                  {meP.bag.map((b, i) => {
                    const I = POWERUP_ICONS[b]
                    return (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5" title={fill(t.powerupKey, { key: 'QW'[i] ?? '', name: powerLabel(b) })}>
                        <I size={14} aria-hidden="true" /> {powerLabel(b)} <kbd className="kbd kbd-hint">{'QW'[i]}</kbd>
                      </span>
                    )
                  })}
                </div>
              )}
            </section>
          )}
          <section className="card">
            <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-soft">{t.log}</h2>
            <ol className="flex flex-col gap-1 text-sm">
              {log.map((l) => (
                <li key={l.seq}>{l.text}</li>
              ))}
            </ol>
          </section>
          <div className="lg:hidden">
            <BoardLegend data={data} />
          </div>
        </aside>

        {showQuestion && cur && (
          <QuestionPanel
            key={state.turn.question?.id}
            data={data}
            state={state}
            playerName={cur.name}
            canAnswer={(mine && state.phase === 'question') || canGuess}
            bag={mine ? cur.bag : []}
            onAnswer={(c) => void send(mine ? { type: 'ANSWER', choice: c } : { type: 'GUESS', choice: c })}
            onPowerup={usePower}
            onContinue={() => void send({ type: 'NEXT_TURN' })}
            autoAt={state.deadline}
            canContinue={mine}
            note={canGuess ? site.online.guessTitle : guessed ? site.online.guessed : undefined}
          />
        )}
        {showOutcome && cur && <OutcomePanel data={data} state={state} playerName={cur.name} onContinue={() => void send({ type: 'NEXT_TURN' })} canContinue={mine} autoAt={state.deadline} />}
        {state.phase === 'discard' && mine && !anim.busy && state.turn.pendingPowerup && (
          <DiscardPanel data={data} bag={cur!.bag} incoming={state.turn.pendingPowerup} onDiscard={(d) => void send({ type: 'DISCARD_POWERUP', discard: d })} />
        )}
        {menu && <GameMenu onClose={() => setMenu(false)} />}
      </div>
      {confetti}
    </>
  )
}
