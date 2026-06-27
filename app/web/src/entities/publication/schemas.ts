import { z } from 'zod'

export const publicationScopeSchema = z.enum(['corrections'])

export type PublicationScope = z.infer<typeof publicationScopeSchema>
