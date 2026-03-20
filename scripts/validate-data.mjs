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

const documentSchema = z.object({
  updatedAt: z.string().min(1),
  experiences: z.array(experienceSchema).min(1),
})

const raw = readFileSync(new URL('../src/data/experiences.json', import.meta.url), 'utf8')
const json = JSON.parse(raw)
const result = documentSchema.safeParse(json)

if (!result.success) {
  console.error('Invalid experiences.json')
  console.error(result.error.format())
  process.exit(1)
}

console.log(`experiences.json is valid (${result.data.experiences.length} entries).`)
