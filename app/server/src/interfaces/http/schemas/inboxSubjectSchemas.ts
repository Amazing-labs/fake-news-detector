import { z } from 'zod'
import { idSchema, mediaInputSchema } from './common'

export const createDirectorInboxSubjectSchema = z.object({
  directorId: idSchema,
  theme: z.string().min(1),
  description: z.string().min(1),
  media: z.array(mediaInputSchema).optional(),
})

export const pickInboxSubjectSchema = z.object({
  journalistId: idSchema,
})

export const deleteInboxSubjectSchema = z.object({
  directorId: idSchema,
  reason: z.string().min(1),
})
