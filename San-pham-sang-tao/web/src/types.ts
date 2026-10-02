export type PillarId = 'dan-chu' | 'phap-quyen' | 'trong-sach'

export interface Quote {
  /** Phần dẫn trước câu trích (không nằm trong ngoặc kép) */
  lead?: string
  text: string
  cite: string
  /** true: tóm ý, không phải trích nguyên văn */
  paraphrase?: boolean
}

export interface Artifact {
  id: string
  date: string
  year: number
  title: string
  subtitle?: string
  pillar: PillarId
  image: { src: string; alt: string; credit: string }
  story: string
  quote: Quote | null
  quoteNote?: string
  today: string
  todayPrompt?: string
  /** Cột "Nguồn sự kiện" trong tài liệu thiết kế */
  eventSource: string
  sourceIds: string[]
  verified: boolean
  /** true: ẩn khỏi web (dòng thời gian, bộ lọc, tiến độ, Trước/Sau, chip liên quan) */
  hidden?: boolean
}

export interface Question {
  id: string
  pillar: PillarId
  title: string
  prompt: string
  /** Đúng 4 lựa chọn, theo thứ tự gốc trong QUIZ-KIEN-THUC.md */
  options: string[]
  /** Chỉ số đáp án đúng trong `options` (thứ tự gốc, trước khi trộn) */
  correctIndex: number
  explain: string
  relatedArtifacts: string[]
}

/** Mức xếp loại theo điểm, min–max tính cả hai đầu */
export interface Level {
  id: string
  min: number
  max: number
  name: string
  message: string
}

export interface QuizData {
  closing: string
  levels: Level[]
  questions: Question[]
}

export interface Reference {
  id: string
  todo?: boolean
  text?: string
  author?: string
  year?: string
  title?: string
  detail?: string
  publisher?: string
  /** Nguồn web: chuỗi APA7 đầy đủ (không gồm URL); *…* là chữ nghiêng */
  apa?: string
  url?: string
}

export interface SourcesData {
  citeFormat: string
  references: Reference[]
  todo: string[]
}

export interface TeamData {
  members: { name: string; role: string }[]
}

export interface MindMapData {
  root: string
  source: string
  pillars: { id: PillarId; name: string; items: { title: string; text: string }[]; todo?: string }[]
}
