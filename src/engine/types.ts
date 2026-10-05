// Kiểu dữ liệu dùng chung cho engine (mục 14, 15.3). Engine là reducer thuần:
// không phụ thuộc trình duyệt hay Node, chạy được trên server và trên trình duyệt.

// ---------- Dữ liệu (src/data/*.json) ----------

export type CellKind = 'gate' | 'question' | 'powerup' | 'trap'
/** loại câu do script nhập tự suy ra (mục 13.4) */
export type QuestionType = 'single' | 'truefalse' | 'fillQuote'
export type Difficulty = 1 | 2 | 3
export type PowerupId = 'advance3' | 'extraRoll' | 'fiftyFifty' | 'swap' | 'shield' | 'double'
export type TrapKind = 'loseTurn' | 'back'

export interface LayoutData {
  label: string
  note?: string
  /** Mỗi nhánh một mảng ô theo chiều đi; ô đầu tiên luôn là cổng */
  branches: CellKind[][]
  /** số ô đường về đích (bản 1.6: ô không gắn trụ cột hay độ khó) */
  homeLength: number
}

export interface BoardData {
  branchCount: number
  defaultLayout: string
  layouts: Record<string, LayoutData>
  cellTypes: Record<string, { label: string; short: string; icon: string; description: string }>
}

export interface RulesData {
  maxPlayers: number
  timeLimitOptions: (number | null)[]
  defaults: GameConfigInput
  options: { horsesPerPlayer: number[]; afterFirstFinish: string[] }
  timers: Timers
  dice: { faces: number; bonusFace: number; stableExitFaces: number[] }
}

export interface Timers {
  rollMs: number
  answerMs: number
  revealMs: number
  noticeMs: number
  disconnectMs: number
  botStepMs: number
}

export interface PowerupData {
  id: PowerupId
  label: string
  kind: 'instant' | 'bag'
  weight: number
  steps?: number
  multiplier?: number
  effect: string
}

export interface PowerupsData {
  bagSize: number
  items: PowerupData[]
}

export interface TrapCard {
  id: string
  kind: TrapKind
  weight: number
  min?: number
  max?: number
  label: string
  effect: string
}

export interface TrapsData {
  cards: TrapCard[]
}

export interface BotsData {
  correctByDifficulty: Record<string, number>
  names: string[]
  rules: {
    useDoubleWhenRemainingAtLeast: number
    useFiftyFiftyMinDifficulty: number
    useSwapMinDifficulty: number
    keepPriority: PowerupId[]
  }
}

/** Câu hỏi (mục 13.4, bản 1.6): không có trụ cột, giải thích, nguồn, xác minh, hiện vật */
export interface Question {
  id: string
  /** chỉ dùng cho nhãn "Độ khó n", lọc Kho câu hỏi và xác suất đúng của máy chơi cùng (mục 5) */
  difficulty: Difficulty
  type: QuestionType
  question: string
  answers: string[]
  correct: number
  test?: boolean
}

/** Toàn bộ dữ liệu engine cần, đã nạp từ JSON (xem data.ts) */
export interface GameData {
  board: BoardData
  rules: RulesData
  powerups: PowerupsData
  traps: TrapsData
  bots: BotsData
  questions: Question[]
  questionById: Map<string, Question>
}

// ---------- Cấu hình ván ----------

export type AfterFirstFinish = 'stop' | 'continue'

export interface GameConfig {
  layout: string
  /** null = không giới hạn */
  timeLimitMin: number | null
  /** Tùy chọn "Phải tung đúng số" (mục 5.4) */
  exactFinish: boolean
  /** Tùy chọn "Ra chuồng khi tung 1 hoặc 6" (mục 5.7) */
  startFromStable: boolean
  horsesPerPlayer: number
  /** Đoán cùng (mục 8) — mặc định tắt */
  guessAlong: boolean
  afterFirstFinish: AfterFirstFinish
  timers: Timers
}

export type GameConfigInput = Partial<Omit<GameConfig, 'timers'>> & { timers?: Partial<Timers> }

export interface PlayerSetup {
  id: string
  name: string
  /** chỉ số màu 0–5, gắn với cổng nhánh cùng chỉ số */
  color: number
  isBot?: boolean
}

export interface GameSetup {
  players: PlayerSetup[]
  config?: GameConfigInput
  seed: number
  now: number
}

// ---------- Trạng thái ván ----------

export type Phase = 'roll' | 'chooseHorse' | 'question' | 'reveal' | 'discard' | 'ended'

export interface HorseState {
  /** bước trên đường của người đó: -1 = trong chuồng, 0 = cổng, finishStep = Đích */
  step: number
  done: boolean
}

export interface PlayerStats {
  turns: number
  rolls: number
  correct: number
  wrong: number
  timeouts: number
  powerupsUsed: number
  trapsHit: number
  shieldBlocks: number
  guessCorrect: number
  guessTotal: number
  /** id các câu trả lời sai (ôn lại ở màn kết thúc) */
  wrongIds: string[]
  /** số lượt liên tiếp hiện tại chưa tiến được */
  stall: number
  maxStall: number
}

export interface PlayerState {
  id: string
  name: string
  color: number
  isBot: boolean
  connected: boolean
  horses: HorseState[]
  bag: PowerupId[]
  skipNext: boolean
  /** thứ tự về đích (1, 2, …) hoặc null */
  finishRank: number | null
  seen: string[]
  stats: PlayerStats
}

export interface ActiveQuestion {
  id: string
  /** độ khó của câu (nhãn hiển thị, máy chơi cùng) — câu rút ngẫu nhiên từ toàn bộ kho (mục 5) */
  difficulty: number
  isFinish: boolean
  /** thứ tự hiển thị: order[i] = chỉ số đáp án gốc ở vị trí i */
  order: number[]
  /** chỉ số đáp án gốc đã bị 50:50 loại */
  eliminated: number[]
  fiftyFiftyUsed: boolean
  swapUsed: boolean
}

export type Outcome =
  | { kind: 'answered'; correct: boolean; timedOut: boolean; chosen: number | null; correctIndex: number; questionId: string; moved: number; finished: boolean }
  | { kind: 'rest'; moved: number }
  | { kind: 'powerup'; moved: number; powerup: PowerupId; extra?: number; kept: boolean }
  /** back = số ô lùi thực tế (nhãn "lùi {n} ô"); drawn = số rút được (1–3), có thể lớn hơn khi bị chặn ở cổng;
   *  bị Khiên chặn: back = 0, drawn = số trên thẻ bị chặn */
  | { kind: 'trap'; moved: number; card: string; back?: number; drawn?: number; blocked: boolean }
  | { kind: 'blocked' }
  | { kind: 'stable'; left: boolean }

export interface TurnState {
  playerId: string
  rollsDone: number
  sixBonusUsed: boolean
  /** số lần tung thêm từ power-up Thêm lượt còn chờ */
  extraRolls: number
  doubleArmed: boolean
  /** lần tung hiện tại được xử lý tự động cho người mất kết nối: câu hỏi tính sai, không dùng power-up */
  auto: boolean
  roll: { face: number; value: number; doubled: boolean } | null
  horse: number | null
  from: number | null
  target: number | null
  question: ActiveQuestion | null
  guesses: Record<string, number>
  pendingPowerup: PowerupId | null
  outcome: Outcome | null
  /** ngựa đã tiến trong lần tung này (cho luật ra 6) */
  movedThisRoll: boolean
  /** tổng tiến độ các ngựa lúc đầu lượt — cuối lượt không vượt mức này thì tính là đứng yên */
  startProgress: number
}

export interface GameEvent {
  seq: number
  type: string
  playerId?: string
  data?: Record<string, unknown>
}

export interface RankEntry {
  playerId: string
  rank: number
  finished: boolean
  remaining: number
  correct: number
}

export interface GameEnd {
  reason: 'finish' | 'allFinished' | 'time' | 'host'
  at: number
  ranking: RankEntry[]
}

export interface GameState {
  /** 2 = bản 1.6 (câu hỏi không có trụ cột); ván lưu / phòng theo định dạng cũ bị bỏ */
  schema: 2
  version: number
  seed: number
  rng: number
  config: GameConfig
  players: PlayerState[]
  /** id người chơi theo thứ tự lượt (trộn theo seed) */
  order: string[]
  turnIndex: number
  turnNumber: number
  phase: Phase
  turn: TurnState
  deadline: number | null
  startedAt: number
  endsAt: number | null
  finishOrder: string[]
  usedQuestions: string[]
  eventSeq: number
  /** sự kiện do hành động gần nhất tạo ra — client diễn hoạt cảnh tuần tự */
  events: GameEvent[]
  /** nhật ký vài sự kiện gần nhất */
  log: GameEvent[]
  ended: GameEnd | null
}

// ---------- Hành động (mục 15.3) ----------

export type Action =
  | { type: 'ROLL'; actor: string; now: number }
  | { type: 'AUTO_ROLL'; actor?: string; now: number }
  | { type: 'CHOOSE_HORSE'; actor: string; horse: number; now: number }
  | { type: 'ANSWER'; actor: string; choice: number; now: number }
  | { type: 'GUESS'; actor: string; choice: number; now: number }
  | { type: 'USE_POWERUP'; actor: string; powerup: PowerupId; now: number }
  | { type: 'DISCARD_POWERUP'; actor: string; discard: PowerupId | 'new'; now: number }
  | { type: 'TIMEOUT'; actor?: string; now: number }
  | { type: 'SKIP_TURN'; actor?: string; now: number }
  | { type: 'BOT_STEP'; actor?: string; now: number }
  | { type: 'NEXT_TURN'; actor?: string; now: number }
  | { type: 'SET_CONNECTED'; playerId: string; connected: boolean; now: number }
  | { type: 'END'; now: number }

export type ErrorCode =
  | 'GAME_ENDED'
  | 'NOT_YOUR_TURN'
  | 'WRONG_PHASE'
  | 'TOO_EARLY'
  | 'NO_POWERUP'
  | 'POWERUP_NOT_USABLE'
  | 'NO_ALTERNATIVE'
  | 'INVALID_CHOICE'
  | 'NOT_ALLOWED'
  | 'UNKNOWN_PLAYER'
  | 'UNKNOWN_ACTION'

export type ActionResult = { ok: true; state: GameState } | { ok: false; error: ErrorCode }
