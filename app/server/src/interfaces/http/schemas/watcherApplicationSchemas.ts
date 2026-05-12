import { z } from 'zod'
export const submitWatcherApplicationSchema = z.object({
  motivation: z.string().min(1),
})

export const watcherDecisionSchema = z.object({})
