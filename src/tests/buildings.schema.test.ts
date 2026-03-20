import { describe, expect, it } from 'vitest'
import { buildingsData } from '../data/buildings'

describe('buildings data', () => {
  it('contains at least one building', () => {
    expect(buildingsData.buildings.length).toBeGreaterThan(0)
  })

  it('contains position and size for all entries', () => {
    for (const building of buildingsData.buildings) {
      expect(typeof building.position.x).toBe('number')
      expect(building.size.x).toBeGreaterThan(0)
      expect(building.size.y).toBeGreaterThan(0)
      expect(building.size.z).toBeGreaterThan(0)
    }
  })
})
