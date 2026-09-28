import { describe, expect, it } from 'vitest'
import artifactsJson from '../data/artifacts.json'
import { artifacts, isVisibleArtifact } from './data'

describe('hiện vật', () => {
  it('bỏ các hiện vật có hidden: true', () => {
    const all = artifactsJson as { id: string; hidden?: boolean }[]
    const hidden = all.filter((a) => a.hidden).map((a) => a.id)
    expect(artifacts).toHaveLength(all.length - hidden.length)
    for (const id of hidden) {
      expect(isVisibleArtifact(id)).toBe(false)
      expect(artifacts.some((a) => a.id === id)).toBe(false)
    }
  })

  it('còn tối thiểu 8 hiện vật hiển thị (mục 4 tài liệu thiết kế)', () => {
    expect(artifacts.length).toBeGreaterThanOrEqual(8)
  })
})
