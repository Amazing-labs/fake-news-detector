import { z } from 'zod'
import {
  authoritySourceInputSchema,
  idSchema,
  mediaCategorySchema,
  mediaTypeSchema,
  sourceTypeSchema,
  verdictSchema,
} from './common'

export const investigationIdParamSchema = z.object({
  investigationId: idSchema,
})

// Lifecycle slices exposed on the collection read. Omitting `scope` means "no
// status filter" — combined with the reader scoping applied in the application
// layer, that is how a journalist lists all of their own dossiers.
export const investigationListQuerySchema = z.object({
  scope: z
    .enum([
      'in-progress',
      'pending-review',
      'published',
      'canceled',
      'contributable',
    ])
    .optional(),
  journalistId: idSchema.optional(),
})

export const investigationSourceMediaParamSchema = z.object({
  investigationId: idSchema,
  mediaId: idSchema,
})

export const investigationEvidenceMediaParamSchema = z.object({
  investigationId: idSchema,
  evidenceId: idSchema,
  mediaId: idSchema,
})

export const updateMediaSchema = z.object({
  category: mediaCategorySchema,
  reliability: verdictSchema,
  justification: z.string().min(1),
})

export const updateInvestigationDraftSchema = z.object({
  mediaCategory: mediaCategorySchema.nullable(),
  draftVerdict: verdictSchema,
  investigationNotes: z.string(),
})

export const proofMediaSchema = z.object({
  url: z.url(),
  type: mediaTypeSchema,
  order: z.number().int().min(0).optional(),
  authoritySourceName: z.string().min(1),
  authoritySourceType: sourceTypeSchema,
})

export const approveInvestigationSchema = z.object({
  // Trimmed before the length check: the domain rejects a whitespace-only note,
  // so it must never get past the boundary in the first place.
  publicationNotes: z.string().trim().min(1),
  verifiedLinks: z
    .array(
      z.object({
        url: z.url(),
        authoritySource: authoritySourceInputSchema.optional(),
      }),
    )
    .optional(),
  verifiedMedia: z
    .array(
      z.object({
        url: z.url(),
        type: mediaTypeSchema,
        order: z.number().int().min(0).optional(),
        authoritySource: authoritySourceInputSchema.optional(),
      }),
    )
    .optional(),
})

export const directorReasonSchema = z.object({
  reason: z.string().min(1),
})

export const archiveSchema = z.object({
  comment: z.string().min(1).optional(),
})

export const submitWatcherEvidenceSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  media: z
    .array(
      z.object({
        url: z.url(),
        type: mediaTypeSchema,
        order: z.number().int().min(0).optional(),
      }),
    )
    .min(1),
})
