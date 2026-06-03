import { z } from 'zod'
import { mediaInputSchema, verificationThemeSchema } from './common'

export const submitReportSchema = z.object({
  theme: verificationThemeSchema,
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
