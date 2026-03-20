import buildingsJson from './buildings.json'
import { buildingsDocumentSchema } from './buildings.schema'

const parseResult = buildingsDocumentSchema.safeParse(buildingsJson)

if (!parseResult.success) {
  throw new Error(`Invalid buildings.json: ${parseResult.error.message}`)
}

export const buildingsData = parseResult.data
