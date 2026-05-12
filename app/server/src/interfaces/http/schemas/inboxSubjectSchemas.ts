import { z } from 'zod'
import { mediaInputSchema } from './common'

export const createDirectorInboxSubjectSchema = z.object({
  theme: z.string().min(1),
  description: z.string().min(1),
  media: z.array(mediaInputSchema).optional(),
})

export const pickInboxSubjectSchema = z.object({})

export const deleteInboxSubjectSchema = z.object({
  reason: z.string().min(1),
})
