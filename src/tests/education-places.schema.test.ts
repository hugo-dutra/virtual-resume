import { describe, expect, it } from 'vitest'
import { educationPlacesData } from '../data/education-places'

describe('education places data', () => {
  it('contains ETB and UCB landmarks', () => {
    const ids = new Set(educationPlacesData.places.map((place) => place.educationId))
    expect(ids.has('etb')).toBe(true)
    expect(ids.has('ucb')).toBe(true)
  })

  it('keeps valid positions and dimensions', () => {
    for (const place of educationPlacesData.places) {
      expect(typeof place.position.x).toBe('number')
      expect(typeof place.position.z).toBe('number')
      expect(place.size.x).toBeGreaterThan(0)
      expect(place.size.y).toBeGreaterThan(0)
      expect(place.size.z).toBeGreaterThan(0)
    }
  })
})
