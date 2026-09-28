import type { Reference } from '../types'
import { sources } from './data'

/** Nguồn đã có (không phải TODO), xếp theo tên tác giả kiểu tiếng Việt. */
export const sortedReferences: Reference[] = sources.references
  .filter((r) => !r.todo)
  .sort((a, b) => (a.author ?? a.apa ?? '').localeCompare(b.author ?? b.apa ?? '', 'vi'))

export const todoReferences = sources.references.filter((r) => r.todo)

export const referenceById = Object.fromEntries(sources.references.map((r) => [r.id, r])) as Record<string, Reference>
