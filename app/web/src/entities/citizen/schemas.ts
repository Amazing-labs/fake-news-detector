import { z } from 'zod'

// Mirrors the server citizenManagementSchema (journalistStatusReasonSchema for
// `reason`). Keep this the source of truth for the ban/disable payload shape so
// it can't drift from the API.
export const citizenStatusReasonSchema = z.enum([
  'SPAM',
  'ABUSE',
  'FRAUD',
  'INACTIVITY',
  'USER_REQUEST',
  'OTHER',
])

export const citizenStatusInputSchema = z.object({
  reason: citizenStatusReasonSchema.optional(),
  details: z.string().min(1).optional(),
})

export type CitizenStatusReason = z.infer<typeof citizenStatusReasonSchema>
export type CitizenStatusInput = z.infer<typeof citizenStatusInputSchema>
