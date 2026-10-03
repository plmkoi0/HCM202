// Đọc docs/nguon/QUIZ-KIEN-THUC.md (bản sao 12 câu kiến thức nhóm đã duyệt, mục 13.1).
// Dùng cho test "12 câu khởi đầu trùng nguyên văn" (mục 17).

const PILLAR_BY_LABEL = {
  'Dân chủ': 'dan-chu',
  'Pháp quyền': 'phap-quyen',
  'Trong sạch, vững mạnh': 'trong-sach',
}

/**
 * @returns {{ number: number, title: string, pillarLabel: string, pillar: string, approved: boolean,
 *   question: string, answers: string[], correct: number, explanation: string, artifact: string }[]}
 */
export function parseQuizSource(markdown) {
  const lines = markdown.split(/\r?\n/)
  const out = []
  let cur = null
  for (const raw of lines) {
    const line = raw.trim()
    const h = /^### Câu (\d+) — (.+?) · (?:trụ cột )?(.+)$/.exec(line)
    if (h) {
      cur = {
        number: Number(h[1]),
        title: h[2].trim(),
        pillarLabel: h[3].trim(),
        pillar: PILLAR_BY_LABEL[h[3].trim()] ?? null,
        approved: false,
        question: '',
        answers: [],
        correct: -1,
        explanation: '',
        artifact: '',
      }
      out.push(cur)
      continue
    }
    if (!cur) continue
    if (/^#{1,3} /.test(line) || line === '---') {
      cur = null
      continue
    }
    if (line.startsWith('Duyệt:')) {
      cur.approved = /\[x\]/i.test(line)
      continue
    }
    const ans = /^- (\*\*)?([A-D])\. (.+?)(\*\*)?( ✅)?$/.exec(line)
    if (ans) {
      if (ans[5]) cur.correct = cur.answers.length
      cur.answers.push(ans[3].trim())
      continue
    }
    const ex = /^\*\*Giải thích:\*\* (.+)$/.exec(line)
    if (ex) {
      cur.explanation = ex[1].trim()
      continue
    }
    const art = /^\*\*Hiện vật liên quan:\*\* (HV-\d+)$/.exec(line)
    if (art) {
      cur.artifact = art[1]
      continue
    }
    if (line && !cur.question && cur.answers.length === 0) cur.question = line
  }
  return out
}
