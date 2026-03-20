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

export const buildingSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  experienceId: z.string().min(1),
  position: positionSchema,
  size: sizeSchema,
  color: z.string().min(1),
  zone: z.string().min(1),
})

export const buildingsDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  buildings: z.array(buildingSchema).min(1),
})

export type Building = z.infer<typeof buildingSchema>
export type BuildingsDocument = z.infer<typeof buildingsDocumentSchema>
