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
      website: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      github: z.string().url().optional(),
    }),
  }),
  skills: z
    .array(
      z.object({
        category: z.string().min(1),
        items: z.array(z.string().min(1)).min(1),
      }),
    )
    .min(1),
  education: z
    .array(
      z.object({
        institution: z.string().min(1),
        degree: z.string().min(1),
        period: z.string().min(1),
        details: z.string().min(1),
      }),
    )
    .min(1),
  projects: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        summary: z.string().min(1),
        tech: z.array(z.string().min(1)).min(1),
        link: z.string().url().optional(),
        repo: z.string().url().optional(),
      }),
    )
    .min(1),
})

const buildingsDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  buildings: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        experienceId: z.string().min(1),
        position: z.object({
          x: z.number(),
          z: z.number(),
        }),
        size: z.object({
          x: z.number().positive(),
          y: z.number().positive(),
          z: z.number().positive(),
        }),
        color: z.string().min(1),
        zone: z.string().min(1),
      }),
    )
    .min(1),
})

const adventureAssetsDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  assets: z
    .array(
      z.object({
        assetId: z.string().min(1),
        category: z.enum(['experience', 'education', 'player', 'ground']),
        relationId: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        format: z.enum(['glb', 'gltf']).default('glb'),
        animations: z
          .object({
            idle: z.string().regex(/\.(fbx|glb|gltf)$/i).optional(),
            walk: z.string().regex(/\.(fbx|glb|gltf)$/i).optional(),
            run: z.string().regex(/\.(fbx|glb|gltf)$/i).optional(),
          })
          .optional(),
        transform: z
          .object({
            scale: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
            offset: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
            rotationY: z.number().optional(),
          })
          .optional(),
      }),
    )
    .min(1),
})

const educationPlacesDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  places: z
    .array(
      z.object({
        id: z.string().min(1),
        educationId: z.string().min(1),
        name: z.string().min(1),
        institution: z.string().min(1),
        period: z.string().min(1),
        details: z.string().min(1),
        position: z.object({ x: z.number(), z: z.number() }),
        size: z.object({
          x: z.number().positive(),
          y: z.number().positive(),
          z: z.number().positive(),
        }),
        color: z.string().min(1),
        zone: z.string().min(1),
      }),
    )
    .min(1),
})

const colleaguesDocumentSchema = z.object({
  updatedAt: z.string().min(1),
  colleagues: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        linkedinUrl: z.string().url(),
        content: z.string().min(1),
        testimonial: z.string().min(1),
        zone: z.string().min(1),
        picturePath: z.string().min(1).optional(),
        movementSpeed: z.number().positive().optional(),
        path: z
          .array(
            z.object({
              x: z.number(),
              z: z.number(),
            }),
          )
          .min(2),
        asset: z.object({
          animations: z.object({
            idle: z.string().regex(/\.(fbx|glb|gltf)$/i),
            walking: z.string().regex(/\.(fbx|glb|gltf)$/i),
          }),
          transform: z
            .object({
              scale: z.object({ x: z.number().positive(), y: z.number().positive(), z: z.number().positive() }).optional(),
              offset: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
              rotationY: z.number().optional(),
            })
            .optional(),
        }),
        interaction: z
          .object({
            stopDistance: z.number().positive().optional(),
            hitbox: z
              .object({
                x: z.number().positive(),
                y: z.number().positive(),
                z: z.number().positive(),
              })
              .optional(),
            minimapIcon: z.string().min(1).max(1).optional(),
          })
          .optional(),
      }),
    )
    .min(1),
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
const buildings = validateJson('../src/data/buildings.json', buildingsDocumentSchema, 'buildings.json')
const adventureAssets = validateJson(
  '../src/data/adventure-assets.json',
  adventureAssetsDocumentSchema,
  'adventure-assets.json',
)
const educationPlaces = validateJson(
  '../src/data/education-places.json',
  educationPlacesDocumentSchema,
  'education-places.json',
)
const colleagues = validateJson('../src/data/colleagues.json', colleaguesDocumentSchema, 'colleagues.json')

console.log(`experiences.json is valid (${experiences.experiences.length} entries).`)
console.log(`profile.json is valid (${profile.projects.length} projects).`)
console.log(`buildings.json is valid (${buildings.buildings.length} buildings).`)
console.log(`adventure-assets.json is valid (${adventureAssets.assets.length} assets).`)
console.log(`education-places.json is valid (${educationPlaces.places.length} places).`)
console.log(`colleagues.json is valid (${colleagues.colleagues.length} entries).`)
