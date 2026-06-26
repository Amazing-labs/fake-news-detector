import { z } from 'zod'
import { idSchema } from './common'

export const publicationIdParamSchema = z.object({
  publicationId: idSchema,
})

export const correctionSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})
