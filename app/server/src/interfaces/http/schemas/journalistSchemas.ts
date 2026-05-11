import { z } from 'zod'
import { idSchema, journalistStatusReasonSchema } from './common'

export const createJournalistSchema = z.object({
  directorId: idSchema,
  name: z.string().min(1),
  email: z.email(),
})

export const journalistActionSchema = z.object({
  directorId: idSchema,
  reason: journalistStatusReasonSchema.optional(),
  details: z.string().min(1).optional(),
})

export const activateJournalistSchema = z.object({
  directorId: idSchema,
})
