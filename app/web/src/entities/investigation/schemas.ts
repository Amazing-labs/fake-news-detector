import { z } from 'zod'

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

export const mediaTypeSchema = z.enum([
  'AUDIO',
  'LINK',
  'TEXT',
  'IMAGE',
  'VIDEO',
  'DOCUMENT',
])

export const sourceTypeSchema = z.enum([
  'OFFICIAL_DECREE',
  'ORIGINAL_RETRACTION',
  'DIRECT_EVIDENCE',
  'MEDIA_CROSSCHECK',
  'AUTHORITY_STATEMENT',
])

export const investigationStatusSchema = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'NEEDS_REVISION',
  'PUBLISHED',
  'ARCHIVED',
  'CANCELED',
])

export const mediaOriginSchema = z.enum([
  'CITIZEN_REPORT',
  'DIRECTOR_INITIATED',
  'JOURNALIST_PROOF',
  'WATCHER',
])

// Write-contract schemas — mirror the server request schemas
// (interfaces/http/schemas/investigationSchemas.ts) so the client shares the
// same source of truth and the request shape cannot silently drift.
export const mediaClassificationInputSchema = z.object({
  category: mediaCategorySchema,
  reliability: verdictSchema,
  justification: z.string().min(1),
})

export const proofMediaInputSchema = z.object({
  url: z.url(),
  type: mediaTypeSchema,
  order: z.number().int().min(0).optional(),
  authoritySourceName: z.string().min(1),
  authoritySourceType: sourceTypeSchema,
})

export const investigationDraftInputSchema = z.object({
  mediaCategory: mediaCategorySchema.nullable(),
  draftVerdict: verdictSchema,
  investigationNotes: z.string(),
})

export type Verdict = z.infer<typeof verdictSchema>
export type MediaCategory = z.infer<typeof mediaCategorySchema>
export type MediaType = z.infer<typeof mediaTypeSchema>
export type SourceType = z.infer<typeof sourceTypeSchema>
export type InvestigationStatus = z.infer<typeof investigationStatusSchema>
export type MediaOrigin = z.infer<typeof mediaOriginSchema>
export type MediaClassificationInput = z.infer<
  typeof mediaClassificationInputSchema
>
export type ProofMediaInput = z.infer<typeof proofMediaInputSchema>
export type InvestigationDraftInput = z.infer<
  typeof investigationDraftInputSchema
>
