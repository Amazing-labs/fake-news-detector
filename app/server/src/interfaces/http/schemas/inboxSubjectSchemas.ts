import { z } from 'zod'
import { idSchema, mediaInputSchema, verificationThemeSchema } from './common'

export const inboxSubjectIdParamSchema = z.object({
  inboxSubjectId: idSchema,
})

export const inboxSubjectListQuerySchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ARCHIVED']).optional(),
})

export const createDirectorInboxSubjectSchema = z.object({
  theme: verificationThemeSchema,
  description: z.string().min(1),
  media: z.array(mediaInputSchema).min(1),
})

// The reason is required by the domain only for REPORT-origin subjects (it is
// shown to the citizen who filed the report). For director-created subjects it
// is omitted, so it is optional at the transport layer and enforced server-side
// per origin. When present it must be non-empty.
export const deleteInboxSubjectSchema = z.object({
  reason: z.string().min(1).optional(),
})
