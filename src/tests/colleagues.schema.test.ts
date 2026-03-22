import { describe, expect, it } from 'vitest'
import { colleaguesData } from '../data/colleagues'

describe('colleagues data', () => {
  it('contains at least one colleague entry', () => {
    expect(colleaguesData.colleagues.length).toBeGreaterThan(0)
  })

  it('uses unique colleague ids', () => {
    const ids = colleaguesData.colleagues.map((colleague) => colleague.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps walking paths with at least two points', () => {
    for (const colleague of colleaguesData.colleagues) {
      expect(colleague.path.length).toBeGreaterThan(1)
    }
  })
})
