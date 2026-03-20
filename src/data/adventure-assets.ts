import adventureAssetsJson from './adventure-assets.json'
import { adventureAssetsDocumentSchema } from './adventure-assets.schema'

const parseResult = adventureAssetsDocumentSchema.safeParse(adventureAssetsJson)

if (!parseResult.success) {
  throw new Error(`Invalid adventure-assets.json: ${parseResult.error.message}`)
}

export const adventureAssetsData = parseResult.data
