import type { Level, Question } from '../types'

/**
 * Số câu trả lời đúng. `answers[i]` là chỉ số lựa chọn (thứ tự gốc) của câu i,
 * hoặc undefined nếu chưa trả lời.
 */
export function score(questions: Question[], answers: (number | undefined)[]): number {
  return questions.reduce((sum, q, i) => sum + (answers[i] === q.correctIndex ? 1 : 0), 0)
}

/** Mức xếp loại chứa điểm `points` (ngưỡng lấy từ quiz.json → levels). */
export function levelFor(points: number, levels: Level[]): Level {
  const level = levels.find((l) => points >= l.min && points <= l.max)
  if (!level) throw new Error(`Không có mức xếp loại cho ${points} điểm`)
  return level
}

export function findLevel(id: unknown, levels: Level[]): Level | undefined {
  return typeof id === 'string' ? levels.find((l) => l.id === id) : undefined
}
