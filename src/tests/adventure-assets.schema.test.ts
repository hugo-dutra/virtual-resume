import { describe, expect, it } from 'vitest'
import { adventureAssetsData } from '../data/adventure-assets'

describe('adventure assets data', () => {
  it('keeps at least one asset per major category', () => {
    const categories = new Set(adventureAssetsData.assets.map((asset) => asset.category))
    expect(categories.has('experience')).toBe(true)
    expect(categories.has('education')).toBe(true)
    expect(categories.has('player')).toBe(true)
  })

  it('uses unique asset ids', () => {
    const ids = adventureAssetsData.assets.map((asset) => asset.assetId)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
