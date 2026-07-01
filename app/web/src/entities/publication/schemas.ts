import { z } from 'zod'

export const publicationScopeSchema = z.enum(['corrections'])

export type PublicationScope = z.infer<typeof publicationScopeSchema>

// Write-contract schema — mirrors the server correctionSchema
// (interfaces/http/schemas/publicationSchemas.ts).
export const createCorrectionInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export type CreateCorrectionInput = z.infer<typeof createCorrectionInputSchema>
