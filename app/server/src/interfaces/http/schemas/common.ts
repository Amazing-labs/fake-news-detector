import { z } from 'zod'

export const idSchema = z.string().min(1)

export const mediaTypeSchema = z.enum([
  'AUDIO',
  'LINK',
  'TEXT',
  'IMAGE',
  'VIDEO',
  'DOCUMENT',
])

export const verdictSchema = z.enum([
  'TRUE',
  'FALSE',
  'MISLEADING',
  'UNVERIFIABLE',
])

export const mediaCategorySchema = z.enum([
  'CONTEXT_COLLAPSE',
  'MANIPULATED',
  'FABRICATED',
  'SATIRE',
  'MISLEADING',
  'IMPOSTOR',
  'OTHER',
])

export const sourceTypeSchema = z.enum([
  'OFFICIAL_DECREE',
  'ORIGINAL_RETRACTION',
  'DIRECT_EVIDENCE',
  'MEDIA_CROSSCHECK',
  'AUTHORITY_STATEMENT',
])

export const verificationThemeSchema = z.enum([
  'Santé',
  'Sécurité',
  'Économie',
  'Éducation',
  'Politique',
  'Environnement',
  'Technologie',
  'Société',
  'Sport',
  'International',
])

export const journalistStatusReasonSchema = z.enum([
  'SPAM',
  'ABUSE',
  'FRAUD',
  'INACTIVITY',
  'USER_REQUEST',
  'OTHER',
])

export const mediaInputSchema = z.object({
  url: z.url(),
  type: mediaTypeSchema,
  order: z.number().int().min(0).optional(),
})

export const authoritySourceInputSchema = z.object({
  name: z.string().min(1),
  type: sourceTypeSchema,
})

export const citizenIdParamSchema = z.object({
  citizenId: idSchema,
})

export const citizenManagementSchema = z.object({
  reason: journalistStatusReasonSchema.optional(),
  details: z.string().min(1).optional(),
})
