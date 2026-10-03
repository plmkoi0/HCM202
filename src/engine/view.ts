// State gửi xuống máy người chơi (mục 15.4):
// - bỏ seed và trạng thái RNG để không đoán trước được xúc xắc, thẻ bẫy, câu hỏi;
// - đáp án đúng không nằm trong state cho tới khi chốt câu (chỉ có trong `turn.outcome`);
// - khi đang trả lời, mỗi máy chỉ thấy lựa chọn Đoán cùng của chính mình — người đang
//   trả lời không thấy người khác đoán gì.

import type { GameState } from './types.js'

export type ClientState = Omit<GameState, 'seed' | 'rng'>

export function clientView(s: GameState, viewerId?: string): ClientState {
  const { seed: _seed, rng: _rng, ...rest } = s
  if (s.phase !== 'question' || Object.keys(s.turn.guesses).length === 0) return rest
  const own = viewerId !== undefined && s.turn.guesses[viewerId] !== undefined ? { [viewerId]: s.turn.guesses[viewerId] } : {}
  return { ...rest, turn: { ...s.turn, guesses: own } }
}
