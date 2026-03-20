import { describe, expect, it } from 'vitest'
import { profileData } from '../data/profile'

describe('profile data', () => {
  it('keeps valid person profile', () => {
    expect(profileData.person.name.length).toBeGreaterThan(0)
    expect(profileData.person.contact.email.includes('@')).toBe(true)
  })

  it('keeps at least one skill group and one project', () => {
    expect(profileData.skills.length).toBeGreaterThan(0)
    expect(profileData.projects.length).toBeGreaterThan(0)
  })
})
