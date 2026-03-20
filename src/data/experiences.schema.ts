import { z } from 'zod'

export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  tech: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(1),
})

export const experiencesDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  experiences: z.array(experienceSchema).min(1),
})

export type Experience = z.infer<typeof experienceSchema>
export type ExperiencesDocument = z.infer<typeof experiencesDocumentSchema>
