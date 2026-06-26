import { z } from 'zod'
import { idSchema } from './common'

export const applicationIdParamSchema = z.object({
  applicationId: idSchema,
})

export const submitWatcherApplicationSchema = z.object({
  motivation: z.string().min(1),
})
