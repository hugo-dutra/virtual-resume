import { describe, expect, it } from 'vitest'
import { experiencesData } from '../data/experiences'

describe('experiences data', () => {
  it('keeps at least one experience entry', () => {
    expect(experiencesData.experiences.length).toBeGreaterThan(0)
  })

  it('keeps required fields', () => {
    const first = experiencesData.experiences[0]
    expect(first.company.length).toBeGreaterThan(0)
    expect(first.tech.length).toBeGreaterThan(0)
  })
})
