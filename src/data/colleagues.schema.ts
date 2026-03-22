import { z } from 'zod'

const pathPointSchema = z.object({
  x: z.number(),
  z: z.number(),
})

const sizeSchema = z.object({
  x: z.number().positive(),
  y: z.number().positive(),
  z: z.number().positive(),
})

const assetTransformSchema = z.object({
  scale: sizeSchema.optional(),
  offset: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  rotationY: z.number().optional(),
})

const colleagueAssetSchema = z.object({
  animations: z.object({
    idle: z.string().regex(/\.(fbx|glb|gltf)$/i),
    walking: z.string().regex(/\.(fbx|glb|gltf)$/i),
  }),
  transform: assetTransformSchema.optional(),
})

const colleagueInteractionSchema = z.object({
  stopDistance: z.number().positive().optional(),
  hitbox: sizeSchema.optional(),
  minimapIcon: z.string().min(1).max(1).optional(),
  minimapBackgroundColor: z.string().min(1).optional(),
  minimapTextColor: z.string().min(1).optional(),
})

export const colleagueSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  linkedinUrl: z.string().url(),
  content: z.string().min(1),
  testimonial: z.string().min(1),
  zone: z.string().min(1),
  picturePath: z.string().min(1).optional(),
  movementSpeed: z.number().positive().optional(),
  path: z.array(pathPointSchema).min(2),
  asset: colleagueAssetSchema,
  interaction: colleagueInteractionSchema.optional(),
})

export const colleaguesDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  colleagues: z.array(colleagueSchema).min(1),
})

export type Colleague = z.infer<typeof colleagueSchema>
export type ColleaguesDocument = z.infer<typeof colleaguesDocumentSchema>
