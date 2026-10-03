// Ván "Chơi trên một máy" (mục 12.4–12.7): bàn cờ, bảng người chơi, khu điều khiển, nhật ký,
// cửa sổ câu hỏi / kết quả / túi đầy / chọn ngựa, hoàn tác, lưu ván, màn kết thúc.
import { Clock, LogOut, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArtifactCard } from '../components/ArtifactCard'
import { Board, BoardLegend } from '../components/Board'
import { Confetti } from '../components/Confetti'
import { GameMenu, MenuButton, SoundButton } from '../components/GameMenu'
import { Countdown } from '../components/Countdown'
import { Dice } from '../components/Dice'
import { EndPanel } from '../components/EndPanel'
import { POWERUP_ICONS, SymbolShape } from '../components/icons'
import { PlayerStrip } from '../components/PlayerStrip'
import { QuestionPanel } from '../components/QuestionPanel'
import { Sheet } from '../components/Sheet'
import { ChooseHorsePanel, DiscardPanel, OutcomePanel } from '../components/TurnPanels'
import { geometry } from '../engine/board'
import { currentPlayer, movableHorses } from '../engine/reducer'
import type { ErrorCode, GameState, PowerupId } from '../engine/types'
import { clearSave, isSoloChallenge, loadRecords, settleRecord, storeRecords, type LocalSave, type RecordResult } from '../game/local'
import { addToReview } from '../game/review'
import { useShortcuts } from '../game/useShortcuts'
import { useBoardAnimation } from '../game/useBoardAnimation'
import { autoActionAt, useAutoActions, useLocalGame } from '../game/useLocalGame'
import { recentLog } from '../lib/eventText'
import { gameData, site, tokens } from '../lib/gameData'
import { useNow, useReducedMotion } from '../lib/hooks'
import { clock, fill } from '../lib/text'

const data = gameData

function TimeLeft({ endsAt, paused }: { endsAt: number | null; paused: boolean }) {
  const now = useNow(500)
  const t = site.game
  if (paused) return <span className="text-sm font-semibold text-ink-soft">{t.paused}</span>
  if (endsAt === null) return <span className="text-sm text-ink-soft">{t.noLimit}</span>
  const left = endsAt - now
  return (
    <span className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${left <= 60_000 ? 'text-bad' : ''}`}>
      <Clock size={16} aria-hidden="true" />
      {left > 0 ? fill(t.timeLeft, { time: clock(left) }) : t.timeUp}
    </span>
  )
}

export function LocalGame({ initial, onHome, onAgain }: { initial: LocalSave; onHome: () => void; onAgain: (s: LocalSave['setup']) => void }) {
  const reduced = useReducedMotion()
  const [record, setRecord] = useState<RecordResult | null>(null)
  // kết thúc: xóa ván đã lưu; thử thách cá nhân → kỷ lục (chỉ lưu khi về đích — L4)
  const onEnded = useCallback((final: GameState) => {
    clearSave()
    // Sổ ôn tập: câu người chơi (không phải máy) trả lời sai
    addToReview(final.players.filter((p) => !p.isBot).flatMap((p) => p.stats.wrongIds))
    if (isSoloChallenge(final)) {
      const { result, records } = settleRecord(final, loadRecords())
      storeRecords(records)
      setRecord(result)
    }
  }, [])
  const { save, state, act, apply, undo, canUndo, paused, setPaused } = useLocalGame(data, initial, onEnded)
  const anim = useBoardAnimation(state, reduced)
  const autoAt = autoActionAt(state, anim.idleAt)
  useAutoActions(state, autoAt, anim.busy || paused, apply)
  const [artifact, setArtifact] = useState<string | null>(null)
  const [confirmQuit, setConfirmQuit] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  // mở thẻ hiện vật / hộp xác nhận thoát → tạm dừng đồng hồ ván và hạn pha
  const openArtifact = (id: string) => {
    setArtifact(id)
    setPaused(true)
  }
  const closeArtifact = useCallback(() => {
    setArtifact(null)
    setPaused(false)
  }, [setPaused])
  const openQuit = () => {
    setConfirmQuit(true)
    setPaused(true)
  }
  const closeQuit = useCallback(() => {
    setConfirmQuit(false)
    setPaused(false)
  }, [setPaused])
  const openMenu = () => {
    setMenu(true)
    setPaused(true)
  }
  const closeMenu = useCallback(() => {
    setMenu(false)
    setPaused(false)
  }, [setPaused])

  const t = site.game
  const ended = state.phase === 'ended'
  const cur = ended ? null : currentPlayer(state)
  const human = cur !== null && !cur.isBot
  const geo = geometry(data, state.config.layout)

  const report = useCallback((err: ErrorCode | null) => {
    if (err) setToast((site.errors as Record<string, string>)[err] ?? err)
  }, [])
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])
  // ván đang chơi: hỏi lại trước khi rời trang (ván vẫn được lưu, mở lại có "Tiếp tục ván")
  useEffect(() => {
    if (ended) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = site.game.leaveWarning
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [ended])

  const rollDice = () => report(act((actor, now) => ({ type: 'ROLL', actor, now })))
  const applyPowerup = (powerup: PowerupId) => report(act((actor, now) => ({ type: 'USE_POWERUP', actor, powerup, now })))
  const answer = (choice: number) => report(act((actor, now) => ({ type: 'ANSWER', actor, choice, now })))
  const next = () => report(act((actor, now) => ({ type: 'NEXT_TURN', actor, now })))
  const discard = (d: PowerupId | 'new') => report(act((actor, now) => ({ type: 'DISCARD_POWERUP', actor, discard: d, now })))
  const choose = (horse: number) => report(act((actor, now) => ({ type: 'CHOOSE_HORSE', actor, horse, now })))

  const movable = useMemo(() => {
    if (state.phase !== 'chooseHorse' || !cur) return []
    const r = state.turn.roll!
    return movableHorses(data, state, cur, r.face, r.value)
  }, [state, cur])

  const target = !ended && cur && state.turn.target !== null && (state.phase === 'question' || state.phase === 'chooseHorse' || state.phase === 'reveal') ? { color: cur.color, step: state.turn.target } : null
  const log = recentLog(data, state, 6)

  // phím tắt (mục 16) — cùng điều kiện với các nút trên màn
  const aq = state.turn.question
  const answering = !ended && human && state.phase === 'question' && aq !== null && !anim.busy
  const revealShown = !ended && state.phase === 'reveal' && state.turn.outcome !== null && !anim.busy
  const powerLabel = (id: PowerupId) => data.powerups.items.find((p) => p.id === id)?.label ?? id
  useShortcuts(
    {
      primary: () => {
        if (state.phase === 'roll' && human && !anim.busy) rollDice()
        else if (revealShown) next()
      },
      answer: (pos) => {
        if (answering) {
          const orig = aq!.order[pos]
          if (orig !== undefined && !aq!.eliminated.includes(orig)) answer(orig)
        } else if (state.phase === 'chooseHorse' && human && !anim.busy && movable.includes(pos)) choose(pos)
      },
      power: (slot) => {
        const item = cur?.bag[slot]
        if (!item || !human || anim.busy) return
        const ok =
          (item === 'double' && state.phase === 'roll' && !state.turn.doubleArmed) ||
          (item === 'fiftyFifty' && answering && !aq!.fiftyFiftyUsed && data.questionById.get(aq!.id)!.answers.length - aq!.eliminated.length > 2) ||
          (item === 'swap' && answering && !aq!.swapUsed)
        if (ok) applyPowerup(item)
        else setToast(fill(t.cannotUseNow, { name: powerLabel(item) }))
      },
    },
    !artifact && !confirmQuit && !menu && !paused,
  )

  // pháo giấy luôn là phần tử thứ hai của Fragment ở cả hai nhánh → không chạy lại khi sang màn kết thúc
  const confetti = <Confetti burst={anim.burst} reduced={reduced} />
  if (ended && !anim.busy) {
    return (
      <>
        <main className="mx-auto w-full max-w-2xl px-4 py-6">
          <EndPanel data={data} state={state} record={record} onAgain={() => onAgain(save.setup)} onHome={onHome} />
        </main>
        {confetti}
      </>
    )
  }

  const tok = cur ? tokens.colors[cur.color] : null
  // câu hỏi hiện sau khi xúc xắc diễn xong (không che xúc xắc); giải thích hiện ngay khi chốt
  const showQuestion = state.turn.question !== null && ((state.phase === 'question' && !anim.busy) || (state.phase === 'reveal' && state.turn.outcome?.kind === 'answered'))
  const roll = state.turn.roll
  const showOutcome = state.phase === 'reveal' && state.turn.outcome !== null && state.turn.outcome.kind !== 'answered' && !anim.busy
  const DoubleIcon = POWERUP_ICONS.double

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-5 lg:px-6">
        <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
          <header className="flex items-center justify-end gap-2 sm:justify-between">
            <p className="hidden truncate font-serif text-lg font-bold sm:block">{site.title}</p>
            <div className="flex items-center gap-2">
              <TimeLeft endsAt={state.endsAt} paused={paused} />
              <SoundButton />
              <MenuButton onOpen={openMenu} />
              <button type="button" className="btn-icon" onClick={undo} disabled={!canUndo || anim.busy} aria-label={t.undo} title={t.undo}>
                <Undo2 size={20} />
              </button>
              <button type="button" className="btn-icon" onClick={openQuit} aria-label={t.quit} title={t.quit}>
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
              selectable={human && state.phase === 'chooseHorse' ? movable : undefined}
              onSelectHorse={choose}
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
                    {fill(t.turnOf, { name: cur.name })}
                  </p>
                  <p className="text-sm text-ink-soft">{fill(t.turnNumber, { n: cur.stats.turns })}</p>
                </div>
                <Dice face={anim.dice.face} rolling={anim.dice.rolling} label={anim.dice.face ? String(anim.dice.value ?? anim.dice.face) : t.roll} />
              </div>
              {roll?.doubled && state.phase !== 'roll' && !anim.dice.rolling && (
                <p className="self-start rounded-full bg-gold px-3 py-0.5 text-sm font-bold text-on-gold">{fill(t.doubledRoll, { face: roll.face, value: roll.value })}</p>
              )}
                    {state.phase === 'roll' && human && !anim.busy && (
                <>
                  {cur.bag.includes('double') && (
                    <button type="button" className={`btn-secondary ${state.turn.doubleArmed ? 'ring-4 ring-gold' : ''}`} disabled={state.turn.doubleArmed} onClick={() => applyPowerup('double')}>
                      <DoubleIcon size={18} aria-hidden="true" /> {state.turn.doubleArmed ? t.doubleArmed : t.doubleButton}
                    </button>
                  )}
                  <button type="button" className="btn-primary btn-big" onClick={rollDice} data-autofocus>
                    {t.roll} <kbd className="kbd kbd-hint">{t.kbdRoll}</kbd>
                  </button>
                  <Countdown deadline={state.deadline} total={state.config.timers.rollMs} label={(s) => fill(t.autoRollIn, { s })} />
                </>
              )}
              {state.phase === 'roll' && (!human || anim.busy) && <p className="text-ink-soft">{anim.dice.rolling ? t.rolling : cur.isBot ? fill(t.botTurn, { name: cur.name }) : ''}</p>}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">{t.bag}:</span>
                {cur.bag.length === 0 && <span className="text-ink-soft">{t.bagEmpty}</span>}
                {cur.bag.map((b, i) => {
                  const I = POWERUP_ICONS[b]
                  return (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5" title={fill(t.powerupKey, { key: 'QW'[i] ?? '', name: powerLabel(b) })}>
                      <I size={14} aria-hidden="true" /> {powerLabel(b)} <kbd className="kbd kbd-hint">{'QW'[i]}</kbd>
                    </span>
                  )
                })}
              </div>
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
            canAnswer={human && state.phase === 'question'}
            bag={cur.bag}
            onAnswer={answer}
            onPowerup={applyPowerup}
            onContinue={next}
            onArtifact={openArtifact}
            autoAt={autoAt}
          />
        )}
        {showOutcome && cur && <OutcomePanel data={data} state={state} playerName={cur.name} onContinue={next} canContinue autoAt={autoAt} />}
        {state.phase === 'discard' && human && !anim.busy && state.turn.pendingPowerup && <DiscardPanel data={data} bag={cur!.bag} incoming={state.turn.pendingPowerup} onDiscard={discard} />}
        {state.phase === 'chooseHorse' && human && !anim.busy && <ChooseHorsePanel data={data} state={state} movable={movable} onChoose={choose} />}
        {artifact && <ArtifactCard id={artifact} onClose={closeArtifact} />}
        {menu && <GameMenu onClose={closeMenu} />}
        {confirmQuit && (
          <Sheet title={t.quit} labelledBy="quit-title" onClose={closeQuit}>
            <p className="mb-4">{t.quitConfirm}</p>
            <div className="flex gap-2">
              <button type="button" className="btn-primary flex-1" onClick={onHome}>
                {t.quitYes}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={closeQuit} data-autofocus>
                {t.quitNo}
              </button>
            </div>
          </Sheet>
        )}
        <div role="status" className={toast ? 'fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl bg-ink px-4 py-3 text-center text-bg shadow-xl' : 'sr-only'}>
          {toast}
        </div>
      </div>
      {confetti}
    </>
  )
}
