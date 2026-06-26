import { z } from 'zod'
import { idSchema } from './common'

export const notificationIdParamSchema = z.object({
  notificationId: idSchema,
})
