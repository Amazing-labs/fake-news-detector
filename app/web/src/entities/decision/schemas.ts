import { z } from 'zod'
import { investigationStatusSchema } from '@entities/investigation/schemas'

// A past editorial decision (workflow-audit row) as exposed by
// GET /api/director/decisions. newStatus/previousStatus reuse the canonical
// investigation-status enum so the client mirrors the server contract.
export const decisionSchema = z.object({
  id: z.string(),
  investigationId: z.string(),
  title: z.string().nullable(),
  newStatus: investigationStatusSchema,
  previousStatus: investigationStatusSchema.nullable(),
  comment: z.string().nullable(),
  createdAt: z.string(),
})

export const decisionListSchema = z.object({
  items: z.array(decisionSchema),
  total: z.number(),
})

export type Decision = z.infer<typeof decisionSchema>
export type DecisionList = z.infer<typeof decisionListSchema>
