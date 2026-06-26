import { z } from 'zod'
import { idSchema, mediaInputSchema, verificationThemeSchema } from './common'

export const reportIdParamSchema = z.object({
  reportId: idSchema,
})

export const reportListQuerySchema = z.object({
  citizenId: idSchema.optional(),
})

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
