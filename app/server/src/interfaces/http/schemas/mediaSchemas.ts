import { z } from 'zod'

// Immediate cleanup of the caller's own unsubmitted uploads (URLs are a hint).
export const mediaCleanupSchema = z.object({
  urls: z.array(z.url()).max(50),
})

// Director-only sweep trigger; both flags default off server-side.
export const mediaSweepSchema = z.object({
  dryRun: z.boolean().optional(),
  force: z.boolean().optional(),
})
