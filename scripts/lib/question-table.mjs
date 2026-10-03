// Đọc và kiểm tra bảng câu hỏi trong docs/CAU-HOI-GAME.md (mẫu: docs/CAU-HOI-GAME.mau.md,
// mục 13.4 — bản 1.6: 8 cột, không có trụ cột, giải thích, nguồn, xác minh, hiện vật).
// Dùng chung cho scripts/import-questions.mjs và test.

/** 8 cột theo đúng thứ tự (mục 13.4) */
export const COLUMNS = ['id', 'độ khó', 'câu hỏi', 'đáp án A', 'đáp án B', 'đáp án C', 'đáp án D', 'đúng']

/** Loại câu — script tự suy ra (mục 13.4), không có cột riêng */
export const TYPES = ['single', 'truefalse', 'fillQuote']
export const LETTERS = ['A', 'B', 'C', 'D']
export const BLANK = '___'

/**
 * Suy ra loại câu (mục 13.4): `fillQuote` nếu câu hỏi có chỗ trống `___`; `truefalse` nếu hai
 * đáp án đúng là "Đúng", "Sai"; còn lại `single`.
 */
export function inferType(question, answers) {
  if (/_{2,}/.test(question)) return 'fillQuote'
  if (answers.length === 2 && answers[0] === 'Đúng' && answers[1] === 'Sai') return 'truefalse'
  return 'single'
}

/** Chuẩn hóa lời câu hỏi để so câu trùng: bỏ dấu câu, khoảng trắng thừa, chữ hoa */
export function questionKey(text) {
  return String(text)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\s"'“”‘’.,:;?!…()«»–—-]+/gu, ' ')
    .trim()
}

/** Tách một dòng bảng Markdown thành các ô (hỗ trợ `\|`) */
export function splitRow(line) {
  let s = line.trim()
  if (s.startsWith('|')) s = s.slice(1)
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1)
  const cells = []
  let cur = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '\\' && s[i + 1] === '|') {
      cur += '|'
      i++
    } else if (ch === '|') {
      cells.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  cells.push(cur.trim())
  return cells
}

function isSeparator(cells) {
  return cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c))
}

/** Dòng trông như một dòng bảng: có ít nhất 2 dấu "|" chưa thoát */
function looksLikeRow(line) {
  return (line.replace(/\\\|/g, '').match(/\|/g) ?? []).length >= 2
}

/**
 * Tìm bảng câu hỏi: bảng có dòng tiêu đề đúng 8 cột ở COLUMNS. Bảng kết thúc ở dòng trống
 * hoặc dòng không có "|". Mọi dòng trông như dòng bảng nằm SAU bảng câu hỏi (bảng bị ngắt
 * bởi dòng trống, comment, bảng thứ hai…) được trả về trong `stray` để báo lỗi — không lặng
 * lẽ bỏ qua.
 * @returns {{ headerLine: number, endLine: number, rows: { line: number, cells: string[] }[], stray: number[] } | null}
 */
export function findQuestionTable(markdown) {
  const lines = markdown.normalize('NFC').split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    if (!looksLikeRow(lines[i])) continue
    const header = splitRow(lines[i]).map((c) => c.toLowerCase())
    if (header.length !== COLUMNS.length || !header.every((c, k) => c === COLUMNS[k].toLowerCase())) continue
    const rows = []
    let j = i + 1
    if (j < lines.length && isSeparator(splitRow(lines[j]))) j++
    for (; j < lines.length; j++) {
      if (!lines[j].trim() || !looksLikeRow(lines[j])) break
      rows.push({ line: j + 1, cells: splitRow(lines[j]) })
    }
    const stray = []
    for (let k = j; k < lines.length; k++) {
      if (looksLikeRow(lines[k]) && !isSeparator(splitRow(lines[k]))) stray.push(k + 1)
    }
    return { headerLine: i + 1, endLine: j, rows, stray }
  }
  return null
}

/**
 * Kiểm tra và chuyển các dòng sang định dạng questions.json (mục 13.4, 17).
 * @param {{ line: number, cells: string[] }[]} rows
 * @param {{ allowTest?: boolean }} [ctx]
 * @returns {{ questions: object[], errors: { line: number, id?: string, message: string }[] }}
 */
export function parseQuestionRows(rows, ctx = {}) {
  const errors = []
  const questions = []
  const seen = new Map()
  const seenQuestion = new Map()
  for (const { line, cells } of rows) {
    const err = (message, id) => errors.push({ line, id, message })
    if (cells.length !== COLUMNS.length) {
      err(`có ${cells.length} cột, cần đúng ${COLUMNS.length} cột (${COLUMNS.join(' · ')})`, cells[0])
      continue
    }
    const [id, diffRaw, question, a, b, c, d, correctRaw] = cells
    const before = errors.length
    if (!id) err('thiếu id')
    else if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(id)) err(`id "${id}" chỉ được gồm chữ, số và dấu gạch ngang`, id)
    else if (seen.has(id)) err(`trùng id "${id}" (đã có ở dòng ${seen.get(id)})`, id)
    if (id && !ctx.allowTest && /^TEST-/i.test(id)) err(`id "${id}" dùng tiền tố TEST- dành cho câu hỏi thử — bộ câu hỏi chính thức không được có câu hỏi thử`, id)
    if (id) seen.set(id, line)
    const difficulty = Number(diffRaw)
    if (![1, 2, 3].includes(difficulty) || String(difficulty) !== diffRaw) err(`độ khó "${diffRaw}" phải là 1, 2 hoặc 3`, id)
    if (!question) err('thiếu câu hỏi', id)
    else {
      const key = questionKey(question)
      if (seenQuestion.has(key)) err(`câu trùng lời câu hỏi với dòng ${seenQuestion.get(key)}`, id)
      else seenQuestion.set(key, line)
    }
    const raw = [a, b, c, d]
    const lastFilled = raw.reduce((k, v, i) => (v ? i : k), -1)
    const answers = raw.slice(0, lastFilled + 1)
    if (answers.some((v) => !v)) err('đáp án phải điền liền nhau từ A (không bỏ trống ở giữa)', id)
    if (answers.length < 2) err('cần ít nhất 2 đáp án (A, B)', id)
    const norm = answers.map((v) => v.trim().toLowerCase())
    if (new Set(norm).size !== norm.length) err('có đáp án trùng nhau', id)
    const type = inferType(question ?? '', answers)
    if (type === 'fillQuote') {
      const runs = question.match(/_{2,}/g) ?? []
      if (runs.length !== 1) err(`câu điền từ cần đúng một chỗ trống "${BLANK}" (đang có ${runs.length})`, id)
      else if (runs[0] !== BLANK) err(`chỗ trống phải đúng 3 dấu gạch dưới "${BLANK}" (đang có ${runs[0].length})`, id)
    }
    const hasTrueFalse = answers.includes('Đúng') && answers.includes('Sai')
    if (hasTrueFalse && answers.length === 2 && type !== 'truefalse') err('câu đúng/sai phải điền A = "Đúng", B = "Sai"', id)
    const correct = LETTERS.indexOf(correctRaw)
    if (correct < 0) err(`cột "đúng" phải là một chữ A–D (đang là "${correctRaw}")`, id)
    else if (correct >= answers.length) err(`đáp án đúng ${correctRaw} chưa được điền`, id)
    if (errors.length > before) continue
    const q = { id, difficulty, type, question, answers, correct }
    if (/^TEST-/i.test(id)) q.test = true
    questions.push(q)
  }
  return { questions, errors }
}

/** Định dạng một câu thành một dòng bảng Markdown */
const escCell = (v) => String(v ?? '').replace(/\|/g, '\\|')

export function formatRow(q) {
  const ans = [0, 1, 2, 3].map((i) => q.answers[i] ?? '')
  return `| ${[q.id, q.difficulty, q.question, ...ans, LETTERS[q.correct]].map(escCell).join(' | ')} |`
}
