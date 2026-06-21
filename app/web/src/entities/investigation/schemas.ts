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

export type Verdict = z.infer<typeof verdictSchema>
export type MediaCategory = z.infer<typeof mediaCategorySchema>
export type MediaType = z.infer<typeof mediaTypeSchema>
export type SourceType = z.infer<typeof sourceTypeSchema>
export type InvestigationStatus = z.infer<typeof investigationStatusSchema>
export type MediaOrigin = z.infer<typeof mediaOriginSchema>
