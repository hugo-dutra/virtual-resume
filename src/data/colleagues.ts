import colleaguesJson from './colleagues.json'
import { colleaguesDocumentSchema } from './colleagues.schema'

const parseResult = colleaguesDocumentSchema.safeParse(colleaguesJson)

if (!parseResult.success) {
  throw new Error(`Invalid colleagues.json: ${parseResult.error.message}`)
}

export const colleaguesData = parseResult.data
