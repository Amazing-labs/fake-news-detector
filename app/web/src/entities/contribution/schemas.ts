import { z } from 'zod'
import { investigationStatusSchema } from '@entities/investigation/schemas'

// A watcher's own past contribution, as exposed by GET /api/me/contributions.
// investigationStatus reuses the canonical investigation-status enum so the
// client mirrors the server contract.
export const contributionSchema = z.object({
  id: z.string(),
  investigationId: z.string(),
  investigationTitle: z.string().nullable(),
  investigationStatus: investigationStatusSchema.nullable(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
})

export const contributionListSchema = z.object({
  items: z.array(contributionSchema),
  total: z.number(),
})

export type Contribution = z.infer<typeof contributionSchema>
export type ContributionList = z.infer<typeof contributionListSchema>
