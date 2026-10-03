// Dữ liệu cho server: cùng các file JSON với giao diện. Dùng import attributes để chạy được
// bằng Node ESM thuần (Vercel biên dịch từng file TypeScript, không gom gói).

import board from '../src/data/board.json' with { type: 'json' }
import bots from '../src/data/bots.json' with { type: 'json' }
import powerups from '../src/data/powerups.json' with { type: 'json' }
import questions from '../src/data/questions.json' with { type: 'json' }
import rules from '../src/data/rules.json' with { type: 'json' }
import site from '../src/data/site.json' with { type: 'json' }
import tokens from '../src/data/tokens.json' with { type: 'json' }
import traps from '../src/data/traps.json' with { type: 'json' }
import { buildGameData, type RawGameData } from '../src/engine/data.js'
import type { GameData } from '../src/engine/types.js'

export const serverData: GameData = buildGameData({ board, rules, powerups, traps, bots, questions } as unknown as RawGameData)

export const siteErrors = site.errors

/** Số màu ngựa (tokens.json) */
export const colorCount = tokens.colors.length
