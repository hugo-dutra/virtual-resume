import { z } from 'zod'

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
  website: z.string().url(),
  linkedin: z.string().url(),
  github: z.string().url(),
})

export const personSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  avatarAlt: z.string().min(1),
  contact: contactSchema,
})

export const skillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  period: z.string().min(1),
  details: z.string().min(1),
})

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  tech: z.array(z.string().min(1)).min(1),
  link: z.string().url().optional(),
  repo: z.string().url().optional(),
})

export const profileDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  person: personSchema,
  skills: z.array(skillGroupSchema).min(1),
  education: z.array(educationSchema).min(1),
  projects: z.array(projectSchema).min(1),
})

export type Contact = z.infer<typeof contactSchema>
export type Person = z.infer<typeof personSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type Education = z.infer<typeof educationSchema>
export type Project = z.infer<typeof projectSchema>
export type ProfileDocument = z.infer<typeof profileDocumentSchema>
