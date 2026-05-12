import { z } from 'zod'
import { journalistStatusReasonSchema } from './common'

export const createJournalistSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
})

export const journalistActionSchema = z.object({
  reason: journalistStatusReasonSchema.optional(),
  details: z.string().min(1).optional(),
})

export const activateJournalistSchema = z.object({})
