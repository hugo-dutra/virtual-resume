import experiencesJson from './experiences.json'
import { experiencesDocumentSchema } from './experiences.schema'

const parseResult = experiencesDocumentSchema.safeParse(experiencesJson)

if (!parseResult.success) {
  throw new Error(`Invalid experiences.json: ${parseResult.error.message}`)
}

export const experiencesData = parseResult.data
