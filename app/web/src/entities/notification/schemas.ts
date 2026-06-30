import { z } from 'zod'

// Visual tone, orthogonal to `type`: success is pleasant, warning puts pressure
// (action required), info simply informs. Mirrors the server NotificationLevel
// enum and is the source of truth for the client.
export const notificationLevelSchema = z.enum(['SUCCESS', 'WARNING', 'INFO'])

export type NotificationLevel = z.infer<typeof notificationLevelSchema>
