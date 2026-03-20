import educationPlacesJson from './education-places.json'
import { educationPlacesDocumentSchema } from './education-places.schema'

const parseResult = educationPlacesDocumentSchema.safeParse(educationPlacesJson)

if (!parseResult.success) {
  throw new Error(`Invalid education-places.json: ${parseResult.error.message}`)
}

export const educationPlacesData = parseResult.data
