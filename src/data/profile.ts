import profileJson from './profile.json'
import { profileDocumentSchema } from './profile.schema'

const parseResult = profileDocumentSchema.safeParse(profileJson)

if (!parseResult.success) {
  throw new Error(`Invalid profile.json: ${parseResult.error.message}`)
}

export const profileData = parseResult.data
