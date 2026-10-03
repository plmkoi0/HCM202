// Nạp toàn bộ dữ liệu JSON cho engine (dùng chung cho giao diện, test, mô phỏng, server).
import artifacts from '../data/artifacts.json'
import board from '../data/board.json'
import bots from '../data/bots.json'
import mindmap from '../data/mindmap.json'
import pillars from '../data/pillars.json'
import powerups from '../data/powerups.json'
import questions from '../data/questions.json'
import rules from '../data/rules.json'
import site from '../data/site.json'
import tokens from '../data/tokens.json'
import traps from '../data/traps.json'
import { buildGameData, type RawGameData } from '../engine/data'
import type { GameData, Question } from '../engine/types'

export const rawGameData = {
  board,
  rules,
  powerups,
  traps,
  bots,
  pillars,
  mindmap,
  questions,
} as unknown as RawGameData

export const gameData: GameData = buildGameData(rawGameData)

export { artifacts, mindmap, site, tokens }

export const questionList = questions as Question[]

/** Còn câu hỏi thử → trang chủ hiện dải "Đang dùng bộ câu hỏi thử" (mục 12.1) */
export const hasTestQuestions = questionList.some((q) => q.test)
