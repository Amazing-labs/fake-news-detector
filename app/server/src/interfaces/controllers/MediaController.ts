import type { Context } from 'hono'
import type { z } from 'zod'
import type { StorageMaintenanceService } from '../../application/services/StorageMaintenanceService'
import type { IMediaStorage } from '../../domain/interfaces'
import type { IReferencedMediaRepository } from '../../domain/repositories'
import type { AppVariables } from '../http/types'
import { validatedJson } from '../http/request'
import { ok } from '../http/responses'
import type {
  mediaCleanupSchema,
  mediaSweepSchema,
} from '../http/schemas/mediaSchemas'

export class MediaController {
  constructor(
    private readonly mediaStorage: IMediaStorage,
    private readonly referencedMedia: IReferencedMediaRepository,
    private readonly storageMaintenance: StorageMaintenanceService,
  ) {}

  // Deletes the caller's own unsubmitted uploads: a single segment under
  // uploads/<actorId>/ (no traversal/nesting) and never an in-use (referenced) object.
  cleanup = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const { urls } = validatedJson<z.infer<typeof mediaCleanupSchema>>(c)

    const prefix = `uploads/${actor.actorId}/`
    const ownedPaths = this.mediaStorage.toObjectPaths(urls).filter((path) => {
      if (!path.startsWith(prefix)) return false
      const name = path.slice(prefix.length)
      return name.length > 0 && !name.includes('/')
    })

    const referencedPaths = new Set(
      this.mediaStorage.toObjectPaths(
        await this.referencedMedia.filterReferencedUrls(urls),
      ),
    )
    const deletable = ownedPaths.filter((path) => !referencedPaths.has(path))

    await this.mediaStorage.deleteObjects(deletable)
    return ok(c, { requested: urls.length, deleted: deletable.length })
  }

  // Director-only sweep trigger (not wired to the web app). Safe defaults:
  // no delete unless dryRun:false, cap enforced unless force:true.
  sweep = async (c: Context<{ Variables: AppVariables }>) => {
    const { dryRun, force } = validatedJson<z.infer<typeof mediaSweepSchema>>(c)
    const report = await this.storageMaintenance.sweepOrphans({
      dryRun: dryRun ?? true,
      force: force ?? false,
    })
    return ok(c, report)
  }
}
