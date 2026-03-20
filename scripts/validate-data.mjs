#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { z } from 'zod'

const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1),
  summary: z.string().min(1),
  tech: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(1),
})

const experiencesDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  experiences: z.array(experienceSchema).min(1),
})

const profileDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  person: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    location: z.string().min(1),
    summary: z.string().min(1),
    avatarAlt: z.string().min(1),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().min(1),
      website: z.string().url(),
      linkedin: z.string().url(),
      github: z.string().url(),
    }),
  }),
  skills: z.array(
    z.object({
      category: z.string().min(1),
      items: z.array(z.string().min(1)).min(1),
    }),
  ).min(1),
  education: z.array(
    z.object({
      institution: z.string().min(1),
      degree: z.string().min(1),
      period: z.string().min(1),
      details: z.string().min(1),
    }),
  ).min(1),
  projects: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      summary: z.string().min(1),
      tech: z.array(z.string().min(1)).min(1),
      link: z.string().url().optional(),
      repo: z.string().url().optional(),
    }),
  ).min(1),
})

function validateJson(path, schema, label) {
  const raw = readFileSync(new URL(path, import.meta.url), 'utf8')
  const parsed = JSON.parse(raw)
  const result = schema.safeParse(parsed)

  if (!result.success) {
    console.error(`Invalid ${label}`)
    console.error(result.error.format())
    process.exit(1)
  }

  return result.data
}

const experiences = validateJson('../src/data/experiences.json', experiencesDocumentSchema, 'experiences.json')
const profile = validateJson('../src/data/profile.json', profileDocumentSchema, 'profile.json')

console.log(`experiences.json is valid (${experiences.experiences.length} entries).`)
console.log(`profile.json is valid (${profile.projects.length} projects).`)
