import { z } from 'zod'
import { idSchema, mediaInputSchema } from './common'

export const submitReportSchema = z.object({
  citizenId: idSchema,
  theme: z.string().min(1),
  title: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? ''),
  content: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value ?? ''),
  media: z.array(mediaInputSchema).optional(),
})
