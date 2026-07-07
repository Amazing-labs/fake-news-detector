import type { IMediaStorage } from '../../domain/interfaces'
import type { IReferencedMediaRepository } from '../../domain/repositories'

// All client uploads live under this prefix.
const UPLOAD_PREFIX = 'uploads'
// Never touch an object younger than this: it may be a freshly uploaded file
// still sitting in a form that hasn't been submitted yet. This threshold's only
// job is to eliminate the race between "unreferenced now" and "about to be
// referenced".
const MIN_AGE_MS = 24 * 60 * 60 * 1000
// Refuse to delete an implausible fraction of the bucket in one run: if a
// keep-set bug ever returns too few references, this stops the sweep from
// wiping live files instead.
const MAX_DELETE_RATIO = 0.5

export interface SweepReport {
  listed: number
  aged: number
  referenced: number
  orphans: number
  deleted: number
  dryRun: boolean
  aborted: boolean
}

// Reconciliation sweep: deletes bucket objects that are old enough AND no longer
// referenced by any media table (the "keep-set"). It is the backstop that
// guarantees orphaned uploads never accumulate — abandoned forms, browser
// crashes, failed immediate-cleanup calls, and best-effort deletion misses.
export class StorageMaintenanceService {
  constructor(
    private readonly storage: IMediaStorage,
    private readonly referencedMedia: IReferencedMediaRepository,
    // When false the sweep only logs what it *would* delete (dry-run), so it can
    // be observed against a real bucket before being armed.
    private readonly enabled: boolean,
  ) {}

  // `force` bypasses the MAX_DELETE_RATIO safety cap. It exists for the one-off
  // manual cleanup of the historical orphan backlog (accumulated back when the
  // client-side delete silently failed): that backlog legitimately exceeds the
  // cap, and until it is cleared once the ratio stays high forever, keeping the
  // scheduled sweep permanently aborted. Never wire `force` to the cron.
  async sweepOrphans(
    options: { dryRun?: boolean; force?: boolean } = {},
  ): Promise<SweepReport> {
    const dryRun = options.dryRun ?? !this.enabled

    const objects = await this.storage.listObjects(UPLOAD_PREFIX)
    const cutoff = Date.now() - MIN_AGE_MS
    const aged = objects.filter((object) => object.createdAt.getTime() < cutoff)

    const referencedUrls = await this.referencedMedia.listReferencedMediaUrls()
    const referencedPaths = new Set(this.storage.toObjectPaths(referencedUrls))

    const orphans = aged.filter((object) => !referencedPaths.has(object.path))

    const report: SweepReport = {
      listed: objects.length,
      aged: aged.length,
      referenced: referencedPaths.size,
      orphans: orphans.length,
      deleted: 0,
      dryRun,
      aborted: false,
    }

    const overCap =
      objects.length > 0 && orphans.length / objects.length > MAX_DELETE_RATIO

    if (overCap && !options.force) {
      console.error(
        `[sweep] ABORT: would delete ${orphans.length}/${objects.length} objects (> ${MAX_DELETE_RATIO * 100}% cap) — refusing (pass --force to override)`,
      )
      return { ...report, aborted: true }
    }

    if (overCap) {
      console.warn(
        `[sweep] FORCE: cap of ${MAX_DELETE_RATIO * 100}% bypassed — proceeding on ${orphans.length}/${objects.length} objects`,
      )
    }

    console.log('[sweep]', JSON.stringify(report))

    if (!dryRun && orphans.length > 0) {
      await this.storage.deleteObjects(orphans.map((object) => object.path))
      report.deleted = orphans.length
    }

    return report
  }
}
