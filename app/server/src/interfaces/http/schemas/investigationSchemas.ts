import { z } from 'zod'
import {
  authoritySourceInputSchema,
  mediaCategorySchema,
  mediaTypeSchema,
  sourceTypeSchema,
  verdictSchema,
} from './common'

export const journalistActionSchema = z.object({})

export const updateMediaSchema = z.object({
  category: mediaCategorySchema,
  reliability: verdictSchema,
  justification: z.string().min(1),
})

export const proofMediaSchema = z.object({
  url: z.url(),
  type: mediaTypeSchema,
  order: z.number().int().min(0).optional(),
  authoritySourceName: z.string().min(1),
  authoritySourceType: sourceTypeSchema,
})

export const approveInvestigationSchema = z.object({
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
