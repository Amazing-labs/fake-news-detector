import { z } from 'zod'
import { idSchema, journalistStatusReasonSchema } from './common'

export const journalistIdParamSchema = z.object({
  journalistId: idSchema,
})

export const createJournalistSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
})

export const journalistActionSchema = z.object({
  reason: journalistStatusReasonSchema.optional(),
  details: z.string().min(1).optional(),
})
