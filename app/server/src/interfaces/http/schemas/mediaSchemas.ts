import { z } from 'zod'

// Immediate cleanup of freshly-uploaded, not-yet-submitted files. The server
// only deletes objects whose path is under the caller's own uploads/<actorId>/
// prefix, so the list is a hint — non-owned or malformed URLs are ignored.
export const mediaCleanupSchema = z.object({
  urls: z.array(z.url()).max(50),
})

// Director-only trigger of the reconciliation sweep. Both flags default off on
// the server side (see MediaController.sweep): an HTTP call must be explicit to
// actually delete (dryRun: false) or to bypass the safety cap (force: true).
export const mediaSweepSchema = z.object({
  dryRun: z.boolean().optional(),
  force: z.boolean().optional(),
})
