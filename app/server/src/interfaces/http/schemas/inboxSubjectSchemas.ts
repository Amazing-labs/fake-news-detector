import { z } from 'zod'
import { idSchema, mediaInputSchema, verificationThemeSchema } from './common'

export const inboxSubjectIdParamSchema = z.object({
  inboxSubjectId: idSchema,
})

export const createDirectorInboxSubjectSchema = z.object({
  theme: verificationThemeSchema,
  description: z.string().min(1),
  media: z.array(mediaInputSchema).optional(),
})

export const deleteInboxSubjectSchema = z.object({
  reason: z.string().min(1),
})
