// Bộ câu hỏi và script nhập (mục 13, 17 — bản 1.6: bảng 8 cột, loại câu tự suy ra).
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runImport, selectTestFill } from '../scripts/import-questions.mjs'
import { COLUMNS, findQuestionTable, inferType, parseQuestionRows } from '../scripts/lib/question-table.mjs'
import { parseQuizSource } from '../scripts/lib/quiz-source.mjs'
import questionsJson from '../src/data/questions.json'
import testPool from '../src/data/test-questions.json'
import type { Question } from '../src/engine/types'

const root = join(__dirname, '..')
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')
const questions = questionsJson as Question[]

// Độ khó nhóm đã xác nhận cho 12 câu khởi đầu (mục 13.1 bản 1.5, giữ nguyên ở bản 1.6)
const DIFFICULTY: Record<string, number> = {
  'Q-05': 1, 'Q-06': 1, 'Q-07': 1, 'Q-09': 1, 'Q-11': 1,
  'Q-01': 2, 'Q-04': 2, 'Q-10': 2, 'Q-12': 2,
  'Q-02': 3, 'Q-03': 3, 'Q-08': 3,
}

describe('12 câu khởi đầu (mục 13.1)', () => {
  const source = parseQuizSource(read('docs/nguon/QUIZ-KIEN-THUC.md'))

  it('bản nguồn có đúng 12 câu, đều đã duyệt, 4 đáp án, đáp án ✅', () => {
    expect(source.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    for (const s of source) {
      expect(s.approved, `Câu ${s.number}`).toBe(true)
      expect(s.answers.length).toBe(4)
      expect(s.correct).toBeGreaterThanOrEqual(0)
    }
  })

  it('questions.json: Q-01 → Q-12 trùng nguyên văn bản nguồn ở câu hỏi, đáp án, đáp án đúng; giữ độ khó đã duyệt', () => {
    for (const s of source) {
      const id = `Q-${String(s.number).padStart(2, '0')}`
      const q = questions.find((x) => x.id === id)
      expect(q, id).toBeDefined()
      expect(q!.question, id).toBe(s.question)
      expect(q!.answers, id).toEqual(s.answers)
      expect(q!.correct, id).toBe(s.correct)
      expect(q!.type, id).toBe('single')
      expect(q!.test, id).toBeUndefined()
      expect(q!.difficulty, id).toBe(DIFFICULTY[id])
    }
  })
})

function parse(md: string, allowTest = false) {
  const t = findQuestionTable(md)!
  return parseQuestionRows(t.rows, { allowTest })
}

const header = `| ${COLUMNS.join(' | ')} |\n|${COLUMNS.map(() => '---').join('|')}|`
const good = '| Q-90 | 1 | Câu hỏi? | Một | Hai | Ba | Bốn | A |'

describe('loại câu tự suy ra (mục 13.4)', () => {
  it.each([
    ['Điền: "Làm ___ cho dân"', ['đầy tớ', 'quan'], 'fillQuote'],
    ['Nhà nước của dân?', ['Đúng', 'Sai'], 'truefalse'],
    ['Nhà nước của dân?', ['Sai', 'Đúng'], 'single'],
    ['Nhà nước của dân?', ['Đúng', 'Sai', 'Không biết'], 'single'],
    ['Câu thường?', ['Một', 'Hai', 'Ba'], 'single'],
  ])('%s %j → %s', (q, answers, type) => {
    expect(inferType(q, answers)).toBe(type)
  })
})

describe('script nhập câu hỏi (mục 13, 17)', () => {
  it('đọc đúng file mẫu docs/CAU-HOI-GAME.mau.md (2 dòng ví dụ là câu hỏi thử nên bị từ chối)', () => {
    const t = findQuestionTable(read('docs/CAU-HOI-GAME.mau.md'))
    expect(t).not.toBeNull()
    expect(t!.rows.length).toBe(2)
    expect(parseQuestionRows(t!.rows).errors.map((e) => e.id)).toEqual(['TEST-01', 'TEST-02'])
    const allowed = parseQuestionRows(t!.rows, { allowTest: true })
    expect(allowed.errors).toEqual([])
    expect(allowed.questions.map((q) => (q as Question).type)).toEqual(['single', 'truefalse'])
  })

  it('đọc đúng docs/CAU-HOI-GAME.md: 55 câu, không lỗi, 4 câu điền từ', () => {
    const res = parse(read('docs/CAU-HOI-GAME.md'))
    expect(res.errors).toEqual([])
    expect(res.questions.length).toBe(55)
    expect((res.questions as Question[]).filter((q) => q.type === 'fillQuote').map((q) => q.id)).toEqual(['Q-14', 'Q-27', 'Q-42', 'Q-44'])
  })

  it('bảng cũ 14 cột (có trụ cột, giải thích, nguồn…) không được nhận', () => {
    const old = '| id | trụ cột | độ khó | loại | câu hỏi | đáp án A | đáp án B | đáp án C | đáp án D | đúng (A–D) | giải thích | nguồn | verified | hiện vật |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|'
    expect(findQuestionTable(old)).toBeNull()
  })

  it('báo rõ dòng sai', () => {
    const rows = [
      good,
      '| Q-91 | 1 | Thiếu cột | A | B |',
      '| Q-92 | 1 | Câu 92? | Một | Hai | | | E |',
      '| Q-93 | 1 | Câu 93? | Một | | Ba | | A |',
      '| Q-94 | 1 | Câu 94? | Một | một | | | A |',
      '| Q-95 | 1 | "___ và ___" | Một | Hai | | | A |',
      '| Q-96 | 1 | Câu 96? | Sai | Đúng | | | A |',
      '| Q-97 | 4 | Câu 97? | Một | Hai | | | C |',
      '| Q-98 | 2 | câu hỏi | Khác | Hẳn | | | A |',
      '| Q-90 | 1 | Trùng id | Một | Hai | | | A |',
      '| Q-99 | 1 | Câu 99? | Chỉ một | | | | A |',
    ]
    const res = parse(`${header}\n${rows.join('\n')}`)
    const by = (id: string) => res.errors.filter((e) => e.id === id).map((e) => e.message).join(' | ')
    expect(res.questions.map((q) => (q as Question).id)).toEqual(['Q-90'])
    expect(by('Q-91')).toMatch(/cột/)
    expect(by('Q-92')).toMatch(/A–D/)
    expect(by('Q-93')).toMatch(/liền nhau/)
    expect(by('Q-94')).toMatch(/đáp án trùng/)
    expect(by('Q-95')).toMatch(/chỗ trống/)
    expect(by('Q-96')).toMatch(/Đúng/)
    expect(by('Q-97')).toMatch(/độ khó/)
    expect(by('Q-97')).toMatch(/chưa được điền/)
    expect(by('Q-98')).toMatch(/câu trùng/)
    expect(by('Q-90')).toMatch(/trùng id/)
    expect(by('Q-99')).toMatch(/ít nhất 2/)
    expect(res.errors.find((e) => e.id === 'Q-91')!.line).toBe(4)
  })

  const msg = (qtext: string) =>
    parse(`${header}\n| Q-80 | 1 | ${qtext} | một | hai | | | A |`)
      .errors.map((e) => e.message)
      .join(' | ')

  it('câu điền từ: đúng một chỗ trống, đúng 3 dấu gạch dưới', () => {
    expect(msg('"Điền ___ vào đây"')).toBe('')
    expect(msg('"Điền ____ vào đây"')).toMatch(/đang có 4/)
    expect(msg('"Điền ______ vào đây"')).toMatch(/đang có 6/)
    expect(msg('"___ và ___"')).toMatch(/đang có 2\)/)
  })

  it('dòng phân cách bảng kiểu |-|-| cũng được nhận; dòng không có | ở đầu vẫn là dòng bảng', () => {
    const md = `| ${COLUMNS.join(' | ')} |\n|${COLUMNS.map(() => '-').join('|')}|\n${good}\nQ-81 | 2 | Câu 81? | Một | Hai | | | B |`
    const res = parse(md)
    expect(res.errors).toEqual([])
    expect(res.questions.map((x) => (x as Question).id)).toEqual(['Q-90', 'Q-81'])
  })

  it.each([
    ['dòng trống', `${good}\n\n| Q-82 | 1 | Câu 82? | Một | Hai | | | E |`],
    ['comment', `${good}\n<!-- ghi chú -->\n| Q-82 | 1 | Câu 82? | Một | Hai | | | A |`],
    ['bảng thứ hai', `${good}\n\nThêm:\n\n${header}\n| Q-82 | 1 | Câu 82? | Một | Hai | | | A |`],
  ])('bảng bị ngắt (%s): báo dòng nằm ngoài bảng, không ghi file', (_name, body) => {
    const dir = mkdtempSync(join(tmpdir(), 'cau-hoi-'))
    const inFile = join(dir, 'CAU-HOI-GAME.md')
    const outFile = join(dir, 'questions.json')
    writeFileSync(inFile, `${header}\n${body}`)
    const res = runImport({ inFile, outFile, check: false })
    expect(res.ok).toBe(false)
    expect(res.messages.join('\n')).toMatch(/nằm ngoài bảng câu hỏi/)
    expect(existsSync(outFile)).toBe(false)
  })

  it('văn bản Unicode tổ hợp (NFD) được chuẩn hóa: câu "Đúng"/"Sai" nhận ra là truefalse', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cau-hoi-'))
    const inFile = join(dir, 'CAU-HOI-GAME.md')
    writeFileSync(inFile, `${header}\n| Q-83 | 1 | Câu? | Đúng | Sai | | | A |`.normalize('NFD'))
    const res = runImport({ inFile, outFile: '', check: true })
    expect(res.ok).toBe(true)
    expect(res.questions![0].type).toBe('truefalse')
  })

  it('không ghi đè questions.json khi còn lỗi', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cau-hoi-'))
    const inFile = join(dir, 'CAU-HOI-GAME.md')
    const outFile = join(dir, 'questions.json')
    writeFileSync(outFile, '["giữ nguyên"]')
    writeFileSync(inFile, `${header}\n| Q-91 | 1 | Thiếu cột |`)
    const res = runImport({ inFile, outFile, check: false })
    expect(res.ok).toBe(false)
    expect(readFileSync(outFile, 'utf8')).toBe('["giữ nguyên"]')
    writeFileSync(inFile, `${header}\n${good}\n| Q-91 | 2 | Câu 91? | Một | Hai | | | A |\n| Q-92 | 3 | Câu 92? | Một | Hai | | | B |`)
    const ok = runImport({ inFile, outFile, check: false })
    expect(ok.ok).toBe(true)
    expect(JSON.parse(readFileSync(outFile, 'utf8'))[0]).toEqual({ id: 'Q-90', difficulty: 1, type: 'single', question: 'Câu hỏi?', answers: ['Một', 'Hai', 'Ba', 'Bốn'], correct: 0 })
  })

  it('cảnh báo (không chặn) khi số câu ba mức chênh nhau quá 3', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cau-hoi-'))
    const inFile = join(dir, 'CAU-HOI-GAME.md')
    const rows = Array.from({ length: 6 }, (_, i) => `| Q-${70 + i} | ${i < 5 ? 1 : 2} | Câu ${i}? | Một | Hai | | | A |`)
    writeFileSync(inFile, `${header}\n${rows.join('\n')}`)
    const res = runImport({ inFile, outFile: '', check: true })
    expect(res.ok).toBe(true)
    expect(res.messages.join('\n')).toMatch(/chênh nhau hơn 3/)
  })

  it('questions.json hiện tại đúng bằng kết quả chạy script trên docs/CAU-HOI-GAME.md', () => {
    const res = runImport({ inFile: join(root, 'docs/CAU-HOI-GAME.md'), outFile: '', check: true })
    expect(res.ok).toBe(true)
    expect(res.questions).toEqual(questions)
  })

  it('câu hỏi thử chỉ lấp độ khó còn dưới 2 câu chính thức', () => {
    const official = questions.filter((q) => !q.test)
    expect(selectTestFill(official, testPool.questions).chosen).toEqual([])
    const onlyHard = official.filter((q) => q.difficulty === 3)
    const { chosen } = selectTestFill(onlyHard, testPool.questions)
    expect(chosen.map((q: Question) => q.difficulty).sort()).toEqual([1, 1, 2, 2])
    for (const q of testPool.questions) {
      expect(q.id.startsWith('TEST-') && q.test === true, q.id).toBe(true)
      expect(q.type, q.id).toBe(inferType(q.question, q.answers))
    }
  })
})
