import { z } from 'zod'
import { idSchema } from './common'

export const correctionSchema = z.object({
  directorId: idSchema,
  title: z.string().min(1),
  content: z.string().min(1),
})
