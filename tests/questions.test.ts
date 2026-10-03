// 12 câu khởi đầu và script nhập câu hỏi (mục 13.1, 17).
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runImport, selectTestFill } from '../scripts/import-questions.mjs'
import { findLetterReference, findQuestionTable, parseQuestionRows, COLUMNS } from '../scripts/lib/question-table.mjs'
import { parseQuizSource } from '../scripts/lib/quiz-source.mjs'
import questionsJson from '../src/data/questions.json'
import testPool from '../src/data/test-questions.json'
import type { Question } from '../src/engine/types'

const root = join(__dirname, '..')
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')
const questions = questionsJson as Question[]
const pillarIds = ['dan-chu', 'phap-quyen', 'trong-sach']
const artifactIds = Array.from({ length: 13 }, (_, i) => `HV-${String(i + 1).padStart(2, '0')}`)

// Hai lời giải thích nhóm sửa (mục 13.1 bản 1.5) — nguyên văn
const FIXED: Record<string, string> = {
  'Q-02': 'Nhà nước của dân tức là "dân là chủ"; nguyên lý này khẳng định địa vị chủ thể tối cao của mọi quyền lực là nhân dân (GT tr. 84).',
  'Q-11':
    'Nguyên nhân chủ quan, bắt nguồn từ căn "bệnh mẹ" là chủ nghĩa cá nhân, sự thiếu tu dưỡng, rèn luyện của cán bộ; âm mưu của các thế lực thù địch và trình độ phát triển thấp của xã hội là nguyên nhân khách quan (GT tr. 94).',
}
// Độ khó nhóm đã xác nhận (mục 13.1)
const DIFFICULTY: Record<string, number> = {
  'Q-05': 1, 'Q-06': 1, 'Q-07': 1, 'Q-09': 1, 'Q-11': 1,
  'Q-01': 2, 'Q-04': 2, 'Q-10': 2, 'Q-12': 2,
  'Q-02': 3, 'Q-03': 3, 'Q-08': 3,
}

/** Tập số trang trích trong ngoặc của lời giải thích, vd. "(Hồ Chí Minh, 2011, t.4, tr.7; GT tr. 88)" */
function cites(e: string) {
  return new Set(
    [...e.matchAll(/\(([^()]*\btr\.[^()]*)\)/g)]
      .flatMap((m) => m[1].split(';'))
      .map((x) => x.trim().replace(/^Hồ Chí Minh, \d{4}, /, '')),
  )
}

const fillRow = (qtext: string) => `| Q-80 | dan-chu | 1 | fillQuote | ${qtext} | một | hai | | | A | Giải thích. | GT tr. 1 | true | |`

describe('12 câu khởi đầu (mục 13.1)', () => {
  const source = parseQuizSource(read('docs/nguon/QUIZ-KIEN-THUC.md'))

  it('bản nguồn có đúng 12 câu, đều đã duyệt, 4 đáp án, đáp án ✅', () => {
    expect(source.map((s) => s.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    for (const s of source) {
      expect(s.approved, `Câu ${s.number}`).toBe(true)
      expect(s.answers.length).toBe(4)
      expect(s.correct).toBeGreaterThanOrEqual(0)
      expect(s.pillar).not.toBeNull()
      expect(s.explanation.length).toBeGreaterThan(0)
    }
  })

  it('hai lời giải thích đã sửa đúng nguyên văn ở mục 13.1 tài liệu thiết kế', () => {
    const design = read('docs/THIET-KE-GAME.md')
    for (const text of Object.values(FIXED)) expect(design).toContain(`> ${text}`)
  })

  it('questions.json: Q-01 → Q-12 trùng nguyên văn bản nguồn (câu hỏi, đáp án, đáp án đúng, giải thích), trừ Q-02, Q-11 theo bản nhóm sửa', () => {
    for (const s of source) {
      const id = `Q-${String(s.number).padStart(2, '0')}`
      const q = questions.find((x) => x.id === id)
      expect(q, id).toBeDefined()
      expect(q!.question, id).toBe(s.question)
      expect(q!.answers, id).toEqual(s.answers)
      expect(q!.correct, id).toBe(s.correct)
      expect(q!.explanation, id).toBe(FIXED[id] ?? s.explanation)
      expect(q!.pillar, id).toBe(s.pillar)
      expect(q!.artifact, id).toBe(s.artifact)
      expect(q!.type, id).toBe('single')
      expect(q!.verified, id).toBe(true)
      expect(q!.test, id).toBeUndefined()
      expect(q!.difficulty, id).toBe(DIFFICULTY[id])
    }
  })

  it('nguồn đúng bằng tập số trang ghi trong giải thích (không thiếu, không thừa); Q-02 còn GT tr. 84', () => {
    for (const id of Object.keys(DIFFICULTY)) {
      const q = questions.find((x) => x.id === id)!
      expect(new Set(q.source.ref.split(';').map((r) => r.trim())), id).toEqual(cites(q.explanation))
    }
    expect(questions.find((x) => x.id === 'Q-02')!.source.ref).toBe('GT tr. 84')
    expect(questions.find((x) => x.id === 'Q-11')!.source.ref).toBe('GT tr. 94')
  })

  it('bản gốc Q-02, Q-11 nhắc chữ cái phương án; bản dùng trong game thì không', () => {
    expect(findLetterReference(source[1].explanation)).toBe('Phương án B')
    expect(findLetterReference(source[10].explanation)).toBe('C và D')
    expect(findLetterReference(FIXED['Q-02'])).toBeNull()
    expect(findLetterReference(FIXED['Q-11'])).toBeNull()
  })

  it('phân bố theo trụ cột: dân chủ 6, pháp quyền 4, trong sạch 2', () => {
    const official = questions.filter((q) => !q.test)
    expect(pillarIds.map((p) => official.filter((q) => q.pillar === p).length)).toEqual([6, 4, 2])
  })

  it('câu hỏi thử chỉ lấp đúng 6 chỗ thiếu: pháp quyền độ khó 2, 3; trong sạch 1, 2 và 2 câu độ khó 3', () => {
    const tests = questions.filter((q) => q.test).map((q) => `${q.pillar}/${q.difficulty}`).sort()
    expect(tests).toEqual(['phap-quyen/2', 'phap-quyen/3', 'trong-sach/1', 'trong-sach/2', 'trong-sach/3', 'trong-sach/3'])
    expect(new Set(questions.filter((q) => q.test).map((q) => q.type))).toEqual(new Set(['truefalse', 'fillQuote', 'situation', 'single']))
  })
})

describe('mẫu chữ cái phương án', () => {
  it.each([
    ['Phương án B là nội dung của "dân làm chủ".', true],
    ['C và D là nguyên nhân khách quan.', true],
    ['A hoặc B đều sai.', true],
    ['Đáp án C nói về pháp quyền.', true],
    ['lựa chọn D không đúng', true],
    ['Đáp án đúng là C vì…', true],
    ['Đáp án: B', true],
    ['Chọn C là sai.', true],
    ['Phương án (B) nói về pháp quyền.', true],
    ['B là nội dung của "dân làm chủ".', true],
    ['đáp án b', true],
    ['Phương án B là nội dung'.normalize('NFD'), true],
    ['C và D là nguyên nhân khách quan.'.normalize('NFD'), true],
    ['(Hồ Chí Minh, 2011, t.4, tr.7; GT tr. 88)', false],
    ['Hai lần lãnh đạo soạn thảo Hiến pháp (1946, 1959).', false],
    ['Dân chủ trực tiếp là hình thức hoàn bị nhất (GT tr. 85).', false],
    ['Hiến pháp (1946, 1959), 16 đạo luật, HV-09.', false],
    ['Cuộc TỔNG TUYỂN CỬ với chế độ phổ thông đầu phiếu', false],
  ])('%s → %s', (text, bad) => {
    expect(findLetterReference(text) !== null).toBe(bad)
  })
})

function parse(md: string) {
  const t = findQuestionTable(md)!
  return parseQuestionRows(t.rows, { pillarIds, artifactIds })
}

describe('script nhập câu hỏi (mục 13.1, 17)', () => {
  const header = `| ${COLUMNS.join(' | ')} |\n|${COLUMNS.map(() => '---').join('|')}|`
  const good =
    '| Q-90 | dan-chu | 1 | single | Câu hỏi? | Một | Hai | Ba | Bốn | A | Giải thích (GT tr. 85). | GT tr. 85 | true | HV-07 |'

  it('đọc đúng file mẫu docs/CAU-HOI-GAME.mau.md (2 dòng ví dụ là câu hỏi thử nên bị từ chối)', () => {
    const t = findQuestionTable(read('docs/CAU-HOI-GAME.mau.md'))
    expect(t).not.toBeNull()
    expect(t!.rows.length).toBe(2)
    const res = parseQuestionRows(t!.rows, { pillarIds, artifactIds })
    expect(res.errors.map((e) => e.id)).toEqual(['TEST-01', 'TEST-02'])
    const allowed = parseQuestionRows(t!.rows, { pillarIds, artifactIds, allowTest: true })
    expect(allowed.errors).toEqual([])
    expect(allowed.questions.map((q) => (q as Question).type)).toEqual(['single', 'truefalse'])
  })

  it('đọc đúng docs/CAU-HOI-GAME.md: 12 câu, không lỗi', () => {
    const res = parse(read('docs/CAU-HOI-GAME.md'))
    expect(res.errors).toEqual([])
    expect(res.questions.length).toBe(12)
  })

  it('báo rõ dòng sai', () => {
    const rows = [
      good,
      '| Q-91 | dan-chu | 1 | single | Thiếu cột | A | B |',
      '| Q-92 | dan-chu | 1 | single | Câu? | Một | Hai | | | E | Giải thích. | GT tr. 1 | true | |',
      '| Q-93 | sai-tru-cot | 1 | single | Câu? | Một | Hai | | | A | Giải thích. | GT tr. 1 | true | |',
      '| Q-94 | dan-chu | 1 | single | Câu? | Một | Hai | | | A | Giải thích. |  | true | |',
      '| Q-95 | dan-chu | 1 | single | Câu? | Một | Hai | | | A | Phương án B sai. | GT tr. 1 | true | |',
      '| Q-96 | dan-chu | 1 | fillQuote | Không có chỗ trống | Một | Hai | | | A | Giải thích. | GT tr. 1 | true | |',
      '| Q-97 | dan-chu | 1 | truefalse | Câu? | Có | Không | | | A | Giải thích. | GT tr. 1 | true | |',
      '| Q-98 | dan-chu | 4 | single | Câu? | Một | Hai | | | C | Giải thích. | GT tr. 1 | có | HV-99 |',
      '| Q-90 | dan-chu | 1 | single | Trùng id | Một | Hai | | | A | Giải thích. | GT tr. 1 | true | |',
    ]
    const res = parse(`${header}\n${rows.join('\n')}`)
    const by = (id: string) => res.errors.filter((e) => e.id === id).map((e) => e.message).join(' | ')
    expect(res.questions.map((q) => (q as Question).id)).toEqual(['Q-90'])
    expect(by('Q-91')).toMatch(/cột/)
    expect(by('Q-92')).toMatch(/A–D/)
    expect(by('Q-93')).toMatch(/trụ cột/)
    expect(by('Q-94')).toMatch(/thiếu nguồn/)
    expect(by('Q-95')).toMatch(/chữ cái phương án/)
    expect(by('Q-96')).toMatch(/chỗ trống/)
    expect(by('Q-97')).toMatch(/truefalse/)
    expect(by('Q-98')).toMatch(/độ khó/)
    expect(by('Q-98')).toMatch(/chưa được điền/)
    expect(by('Q-98')).toMatch(/verified/)
    expect(by('Q-98')).toMatch(/hiện vật/)
    expect(by('Q-90')).toMatch(/trùng id/)
    expect(res.errors.find((e) => e.id === 'Q-91')!.line).toBe(4)
  })

  const msg = (qtext: string) =>
    parse(`${header}\n${fillRow(qtext)}`)
      .errors.map((e) => e.message)
      .join(' | ')

  it('câu fillQuote: đúng một chỗ trống, đúng 3 dấu gạch dưới', () => {
    expect(msg('"Điền ___ vào đây"')).toBe('')
    expect(msg('"Điền ____ vào đây"')).toMatch(/đang có 4/)
    expect(msg('"Điền _____ vào đây"')).toMatch(/đang có 5/)
    expect(msg('"Điền ______ vào đây"')).toMatch(/đang có 6/)
    expect(msg('"___ và ___"')).toMatch(/đang có 2\)/)
    expect(msg('"Không có chỗ trống"')).toMatch(/đang có 0/)
  })

  it('dòng phân cách bảng kiểu |-|-| cũng được nhận; dòng không có | ở đầu vẫn là dòng bảng', () => {
    const md = `| ${COLUMNS.join(' | ')} |\n|${COLUMNS.map(() => '-').join('|')}|\n${good}\nQ-81 | dan-chu | 1 | single | Câu? | Một | Hai | | | A | Giải thích. | GT tr. 1 | true | |`
    const res = parse(md)
    expect(res.errors).toEqual([])
    expect(res.questions.map((x) => (x as Question).id)).toEqual(['Q-90', 'Q-81'])
  })

  it.each([
    ['dòng trống', `${good}\n\n| Q-82 | dan-chu | 1 | single | Câu? | Một | Hai | | | E | Giải thích. | GT tr. 1 | true | |`],
    ['comment', `${good}\n<!-- ghi chú -->\n| Q-82 | dan-chu | 1 | single | Câu? | Một | Hai | | | A | Giải thích. | GT tr. 1 | true | |`],
    ['bảng thứ hai', `${good}\n\nThêm:\n\n| ${COLUMNS.join(' | ')} |\n|${COLUMNS.map(() => '---').join('|')}|\n| Q-82 | dan-chu | 1 | single | Câu? | Một | Hai | | | A | Giải thích. | GT tr. 1 | true | |`],
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

  it('văn bản Unicode tổ hợp (NFD) được chuẩn hóa: truefalse "Đúng"/"Sai" hợp lệ, chữ cái phương án vẫn bị bắt', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cau-hoi-'))
    const inFile = join(dir, 'CAU-HOI-GAME.md')
    const outFile = join(dir, 'questions.json')
    writeFileSync(inFile, `${header}\n| Q-83 | dan-chu | 1 | truefalse | Câu? | Đúng | Sai | | | A | Giải thích. | GT tr. 1 | true | |`.normalize('NFD'))
    expect(runImport({ inFile, outFile, check: true }).ok).toBe(true)
    writeFileSync(inFile, `${header}\n| Q-84 | dan-chu | 1 | single | Câu? | Một | Hai | | | A | Phương án B sai. | GT tr. 1 | true | |`.normalize('NFD'))
    const bad = runImport({ inFile, outFile, check: true })
    expect(bad.ok).toBe(false)
    expect(bad.messages.join('\n')).toMatch(/chữ cái phương án/)
  })

  it('không ghi đè questions.json khi còn lỗi', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cau-hoi-'))
    const inFile = join(dir, 'CAU-HOI-GAME.md')
    const outFile = join(dir, 'questions.json')
    writeFileSync(outFile, '["giữ nguyên"]')
    writeFileSync(inFile, `${header}\n| Q-91 | dan-chu | 1 | single | Thiếu cột |`)
    const res = runImport({ inFile, outFile, check: false })
    expect(res.ok).toBe(false)
    expect(readFileSync(outFile, 'utf8')).toBe('["giữ nguyên"]')
    writeFileSync(inFile, `${header}\n${good}`)
    const ok = runImport({ inFile, outFile, check: false })
    expect(ok.ok).toBe(true)
    expect(existsSync(outFile)).toBe(true)
    expect(JSON.parse(readFileSync(outFile, 'utf8'))[0].id).toBe('Q-90')
  })

  it('questions.json hiện tại đúng bằng kết quả chạy script trên docs/CAU-HOI-GAME.md', () => {
    const res = runImport({ inFile: join(root, 'docs/CAU-HOI-GAME.md'), outFile: '', check: true })
    expect(res.ok).toBe(true)
    expect(res.questions).toEqual(questions)
  })

  it('câu hỏi thử ưu tiên loại câu còn thiếu và không lấp tổ hợp đã đủ', () => {
    const official = questions.filter((q) => !q.test)
    const { chosen, missingTypes } = selectTestFill(official, testPool.questions, pillarIds)
    expect(missingTypes).toEqual([])
    expect(chosen.every((q: Question) => !(q.pillar === 'dan-chu'))).toBe(true)
  })
})
