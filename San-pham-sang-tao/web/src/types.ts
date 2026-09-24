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
}

export type CitizenTypeId = 'A' | 'B' | 'C' | 'D'

export interface CitizenType {
  id: CitizenTypeId
  name: string
  desc: string
  quote: Quote
  actions: string[]
  relatedArtifacts: string[]
}

export interface Question {
  id: string
  title: string
  prompt: string
  options: { type: CitizenTypeId; text: string }[]
  explain: string
}

export interface QuizData {
  closing: string
  types: CitizenType[]
  questions: Question[]
  tieBreak: CitizenTypeId[]
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
