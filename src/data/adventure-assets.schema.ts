import { z } from 'zod'

const vector3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
})

const assetTransformSchema = z.object({
  scale: vector3Schema.optional(),
  offset: vector3Schema.optional(),
  rotationY: z.number().optional(),
})

export const adventureAssetSchema = z.object({
  assetId: z.string().min(1),
  category: z.enum(['experience', 'education', 'player', 'ground']),
  relationId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  format: z.enum(['glb', 'gltf']).default('glb'),
  transform: assetTransformSchema.optional(),
})

export const adventureAssetsDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  assets: z.array(adventureAssetSchema).min(1),
})

export type AdventureAsset = z.infer<typeof adventureAssetSchema>
export type AdventureAssetsDocument = z.infer<typeof adventureAssetsDocumentSchema>
