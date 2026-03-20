import { z } from 'zod'

const positionSchema = z.object({
  x: z.number(),
  z: z.number(),
})

const sizeSchema = z.object({
  x: z.number().positive(),
  y: z.number().positive(),
  z: z.number().positive(),
})

export const educationPlaceSchema = z.object({
  id: z.string().min(1),
  educationId: z.string().min(1),
  name: z.string().min(1),
  institution: z.string().min(1),
  position: positionSchema,
  size: sizeSchema,
  color: z.string().min(1),
  zone: z.string().min(1),
})

export const educationPlacesDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  places: z.array(educationPlaceSchema).min(1),
})

export type EducationPlace = z.infer<typeof educationPlaceSchema>
export type EducationPlacesDocument = z.infer<typeof educationPlacesDocumentSchema>
