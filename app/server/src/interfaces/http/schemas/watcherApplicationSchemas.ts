import { z } from 'zod'
import { idSchema } from './common'

export const submitWatcherApplicationSchema = z.object({
  citizenId: idSchema,
  motivation: z.string().min(1),
})

export const watcherDecisionSchema = z.object({
  directorId: idSchema,
})
