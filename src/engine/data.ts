import type {
  BoardData,
  BotsData,
  GameData,
  Pillar,
  PowerupsData,
  Question,
  RulesData,
  TrapsData,
} from './types.js'

export interface RawGameData {
  board: BoardData
  rules: RulesData
  powerups: PowerupsData
  traps: TrapsData
  bots: BotsData
  /** pillars.json — nhãn, tên, màu */
  pillars: { pillars: Pillar[] }
  /** mindmap.json — thứ tự trụ cột (mục 4, D1) */
  mindmap: { pillars: { id: string; name: string }[] }
  questions: Question[]
}

export function poolKey(pillar: string, difficulty: number): string {
  return `${pillar}|${difficulty}`
}

/**
 * Nạp dữ liệu cho engine. Thứ tự trụ cột lấy theo mindmap.json (D1: nhánh i →
 * trụ cột thứ ((i − 1) mod số trụ cột) + 1); nhãn, tên, màu lấy từ pillars.json.
 */
export function buildGameData(raw: RawGameData): GameData {
  const byId = new Map(raw.pillars.pillars.map((p) => [p.id, p]))
  const pillars: Pillar[] = raw.mindmap.pillars.map((m) => {
    const p = byId.get(m.id)
    if (!p) throw new Error(`Trụ cột "${m.id}" có trong mindmap.json nhưng thiếu trong pillars.json`)
    return p
  })
  if (pillars.length === 0) throw new Error('Không có trụ cột nào')

  const questionById = new Map<string, Question>()
  const questionPools = new Map<string, Question[]>()
  for (const q of raw.questions) {
    if (questionById.has(q.id)) throw new Error(`Trùng id câu hỏi ${q.id}`)
    questionById.set(q.id, q)
    const key = poolKey(q.pillar, q.difficulty)
    const pool = questionPools.get(key)
    if (pool) pool.push(q)
    else questionPools.set(key, [q])
  }
  if (raw.questions.length === 0) throw new Error('Kho câu hỏi rỗng')

  return {
    board: raw.board,
    rules: raw.rules,
    powerups: raw.powerups,
    traps: raw.traps,
    bots: raw.bots,
    pillars,
    questions: raw.questions,
    questionById,
    questionPools,
  }
}
