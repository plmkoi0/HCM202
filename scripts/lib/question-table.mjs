// Đọc và kiểm tra bảng câu hỏi trong docs/CAU-HOI-GAME.md (mẫu: docs/CAU-HOI-GAME.mau.md,
// mục 13.4). Dùng chung cho scripts/import-questions.mjs và test.

/** 14 cột theo đúng thứ tự (mục 13.4) */
export const COLUMNS = [
  'id',
  'trụ cột',
  'độ khó',
  'loại',
  'câu hỏi',
  'đáp án A',
  'đáp án B',
  'đáp án C',
  'đáp án D',
  'đúng (A–D)',
  'giải thích',
  'nguồn',
  'verified',
  'hiện vật',
]

export const TYPES = ['single', 'truefalse', 'fillQuote', 'situation']
export const LETTERS = ['A', 'B', 'C', 'D']
export const BLANK = '___'

/**
 * Mẫu giải thích nhắc chữ cái phương án (mục 13.4, 17): "phương án B", "đáp án C",
 * "Đáp án đúng là B", "Chọn C", "(B)", "C và D", "A hoặc B", "B là …"… Game trộn đáp án
 * nên chữ cái không còn đúng. So khớp trên chuỗi đã chuẩn hóa NFC.
 */
const LETTER_PATTERNS = [
  // từ khóa + (đúng/sai/là/:) + chữ cái, có thể trong ngoặc
  /(?<!\p{L})(?:[Pp]hương án|[Đđ]áp án|[Ll]ựa chọn|[Cc]họn|[Cc]âu|[Ýý])(?:\s+(?:đúng|sai))?(?:\s*(?:là|:))?\s*\(?[A-Da-d]\)?(?![\p{L}\p{N}])/u,
  // hai chữ cái nối nhau: "C và D", "A hoặc B", "A, B", "A/B"
  /(?<![\p{L}\p{N}])[A-D]\s*(?:,|và|hoặc|hay|\/|–|-)\s*[A-D](?![\p{L}\p{N}])/u,
  // chữ cái trong ngoặc: "(B)"
  /\([A-D]\)/u,
  // chữ hoa A–D đứng riêng như một từ: "B là nội dung…" (không bắt HV-09, tr. 85…)
  /(?<![\p{L}\p{N}\-.])[A-D](?![\p{L}\p{N}\-.])/u,
]

/** Trả về đoạn chữ vi phạm, hoặc null */
export function findLetterReference(text) {
  const t = String(text).normalize('NFC')
  for (const re of LETTER_PATTERNS) {
    const m = re.exec(t)
    if (m) return m[0].trim()
  }
  return null
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
 * Tìm bảng câu hỏi: bảng có dòng tiêu đề đúng 14 cột ở COLUMNS. Bảng kết thúc ở dòng
 * trống hoặc dòng không có "|". Mọi dòng trông như dòng bảng nằm SAU bảng câu hỏi
 * (bảng bị ngắt bởi dòng trống, comment, bảng thứ hai…) được trả về trong `stray`
 * để báo lỗi — không lặng lẽ bỏ qua.
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
 * Kiểm tra và chuyển các dòng sang định dạng questions.json (mục 13.4).
 * @param {{ line: number, cells: string[] }[]} rows
 * @param {{ pillarIds: string[], artifactIds: string[], allowTest?: boolean }} ctx
 * @returns {{ questions: object[], errors: { line: number, id?: string, message: string }[] }}
 */
export function parseQuestionRows(rows, ctx) {
  const errors = []
  const questions = []
  const seen = new Map()
  for (const { line, cells } of rows) {
    const err = (message, id) => errors.push({ line, id, message })
    if (cells.length !== COLUMNS.length) {
      err(`có ${cells.length} cột, cần đúng ${COLUMNS.length} cột (${COLUMNS.join(' · ')})`, cells[0])
      continue
    }
    const [id, pillar, diffRaw, type, question, a, b, c, d, correctRaw, explanation, sourceRef, verifiedRaw, artifact] = cells
    const before = errors.length
    if (!id) err('thiếu id')
    else if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(id)) err(`id "${id}" chỉ được gồm chữ, số và dấu gạch ngang`, id)
    else if (seen.has(id)) err(`trùng id "${id}" (đã có ở dòng ${seen.get(id)})`, id)
    if (id && !ctx.allowTest && /^TEST-/i.test(id)) err(`id "${id}" dùng tiền tố TEST- dành cho câu hỏi thử — bộ câu hỏi chính thức không được có câu hỏi thử`, id)
    if (id) seen.set(id, line)
    if (!ctx.pillarIds.includes(pillar)) err(`trụ cột "${pillar}" không hợp lệ (hợp lệ: ${ctx.pillarIds.join(', ')})`, id)
    const difficulty = Number(diffRaw)
    if (![1, 2, 3].includes(difficulty) || String(difficulty) !== diffRaw) err(`độ khó "${diffRaw}" phải là 1, 2 hoặc 3`, id)
    if (!TYPES.includes(type)) err(`loại "${type}" không hợp lệ (hợp lệ: ${TYPES.join(', ')})`, id)
    if (!question) err('thiếu câu hỏi', id)
    const raw = [a, b, c, d]
    const lastFilled = raw.reduce((k, v, i) => (v ? i : k), -1)
    const answers = raw.slice(0, lastFilled + 1)
    if (answers.some((v) => !v)) err('đáp án phải điền liền nhau từ A (không bỏ trống ở giữa)', id)
    if (answers.length < 2) err('cần ít nhất 2 đáp án (A, B)', id)
    const norm = answers.map((v) => v.trim().toLowerCase())
    if (new Set(norm).size !== norm.length) err('có đáp án trùng nhau', id)
    if (type === 'truefalse' && !(answers.length === 2 && a === 'Đúng' && b === 'Sai')) err('câu truefalse chỉ điền A = "Đúng", B = "Sai", để trống C, D', id)
    if (type === 'fillQuote') {
      const runs = question.match(/_{2,}/g) ?? []
      if (runs.length !== 1) err(`câu fillQuote cần đúng một chỗ trống "${BLANK}" (đang có ${runs.length})`, id)
      else if (runs[0] !== BLANK) err(`chỗ trống phải đúng 3 dấu gạch dưới "${BLANK}" (đang có ${runs[0].length})`, id)
    }
    const correct = LETTERS.indexOf(correctRaw)
    if (correct < 0) err(`cột "đúng" phải là một chữ A–D (đang là "${correctRaw}")`, id)
    else if (correct >= answers.length) err(`đáp án đúng ${correctRaw} chưa được điền`, id)
    if (!explanation) err('thiếu giải thích', id)
    else {
      const ref = findLetterReference(explanation)
      if (ref) err(`giải thích nhắc chữ cái phương án ("${ref}") — game trộn đáp án nên phải nêu thẳng nội dung phương án`, id)
    }
    if (!sourceRef) err('thiếu nguồn (cần số trang, vd. "GT tr. 85")', id)
    if (verifiedRaw !== 'true' && verifiedRaw !== 'false') err(`verified "${verifiedRaw}" phải là true hoặc false`, id)
    if (artifact && !ctx.artifactIds.includes(artifact)) err(`hiện vật "${artifact}" không có trong artifacts.json`, id)
    if (errors.length > before) continue
    const q = {
      id,
      pillar,
      ...(artifact ? { artifact } : {}),
      type,
      difficulty,
      question,
      answers,
      correct,
      explanation,
      source: { ref: sourceRef },
      verified: verifiedRaw === 'true',
    }
    if (/^TEST-/i.test(id)) q.test = true
    questions.push(q)
  }
  return { questions, errors }
}

/** Định dạng một câu thành một dòng bảng Markdown */
const escCell = (v) => String(v ?? '').replace(/\|/g, '\\|')

export function formatRow(q) {
  const ans = [0, 1, 2, 3].map((i) => q.answers[i] ?? '')
  const cells = [
    q.id,
    q.pillar,
    q.difficulty,
    q.type,
    q.question,
    ...ans,
    LETTERS[q.correct],
    q.explanation,
    q.source.ref,
    q.verified ? 'true' : 'false',
    q.artifact ?? '',
  ]
  return `| ${cells.map(escCell).join(' | ')} |`
}
