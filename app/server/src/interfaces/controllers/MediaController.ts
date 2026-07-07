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

  // Immediately deletes not-yet-submitted uploads the caller owns. Two layers of
  // authorization keep this from becoming a delete-anything primitive:
  //   1. Ownership — only objects under the caller's own `uploads/<actorId>/`
  //      prefix AND limited to a single filename segment. Requiring one segment
  //      (no '/') rejects path traversal (`uploads/<me>/../<victim>/x`) and
  //      nesting, so one actor can never reach another actor's — or an
  //      arbitrary — object. (Guards against BOLA / IDOR.)
  //   2. Not-in-use — objects still referenced by a committed DB row are
  //      excluded, so this endpoint can only ever remove abandoned drafts, never
  //      live, already-submitted media.
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

  // Director-only maintenance trigger for the reconciliation sweep. Deliberately
  // NOT wired to the web client — it exists so an operator can run a dry-run
  // (observe the report) or a forced run (bypass the safety cap to clear the
  // historical orphan backlog) over HTTP. Defaults are safe: without an explicit
  // `dryRun: false` it never deletes, and without `force: true` the 50% cap still
  // protects against a keep-set bug.
  sweep = async (c: Context<{ Variables: AppVariables }>) => {
    const { dryRun, force } = validatedJson<z.infer<typeof mediaSweepSchema>>(c)
    const report = await this.storageMaintenance.sweepOrphans({
      dryRun: dryRun ?? true,
      force: force ?? false,
    })
    return ok(c, report)
  }
}
