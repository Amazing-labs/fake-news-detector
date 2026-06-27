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

export const deleteInboxSubjectSchema = z.object({
  reason: z.string().min(1),
})
