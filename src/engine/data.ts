import type { BoardData, BotsData, GameData, PowerupsData, Question, RulesData, TrapsData } from './types.js'

export interface RawGameData {
  board: BoardData
  rules: RulesData
  powerups: PowerupsData
  traps: TrapsData
  bots: BotsData
  questions: Question[]
}

/** Nạp dữ liệu cho engine (bản 1.6: kho câu hỏi là một kho chung, không chia trụ cột / độ khó) */
export function buildGameData(raw: RawGameData): GameData {
  const questionById = new Map<string, Question>()
  for (const q of raw.questions) {
    if (questionById.has(q.id)) throw new Error(`Trùng id câu hỏi ${q.id}`)
    questionById.set(q.id, q)
  }
  if (raw.questions.length === 0) throw new Error('Kho câu hỏi rỗng')

  return {
    board: raw.board,
    rules: raw.rules,
    powerups: raw.powerups,
    traps: raw.traps,
    bots: raw.bots,
    questions: raw.questions,
    questionById,
  }
}
