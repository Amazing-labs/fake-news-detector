import type { IMediaStorage } from '../../domain/interfaces'
import type { IReferencedMediaRepository } from '../../domain/repositories'

const UPLOAD_PREFIX = 'uploads'
// Grace period: skip objects younger than this (may be an unsubmitted upload).
const MIN_AGE_MS = 24 * 60 * 60 * 1000
// Abort if a run would delete more than this fraction of the eligible pool.
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

/** Backstop that deletes aged, unreferenced bucket objects (orphaned uploads). */
export class StorageMaintenanceService {
  constructor(
    private readonly storage: IMediaStorage,
    private readonly referencedMedia: IReferencedMediaRepository,
    // Dry-run unless armed; a getter defers the read to run time (Workers env).
    private readonly enabled: boolean | (() => boolean),
  ) {}

  // `force` bypasses the safety cap (one-off backlog cleanup); never used by the cron.
  async sweepOrphans(
    options: { dryRun?: boolean; force?: boolean } = {},
  ): Promise<SweepReport> {
    const isEnabled =
      typeof this.enabled === 'function' ? this.enabled() : this.enabled
    const dryRun = options.dryRun ?? !isEnabled

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

    // Ratio against the aged (eligible) pool, so young uploads can't dilute it.
    const overCap =
      aged.length > 0 && orphans.length / aged.length > MAX_DELETE_RATIO

    if (overCap && !options.force) {
      console.error(
        `[sweep] ABORT: would delete ${orphans.length}/${aged.length} eligible objects (> ${MAX_DELETE_RATIO * 100}% cap) — refusing (pass --force to override)`,
      )
      return { ...report, aborted: true }
    }

    if (overCap) {
      console.warn(
        `[sweep] FORCE: cap of ${MAX_DELETE_RATIO * 100}% bypassed — proceeding on ${orphans.length}/${aged.length} eligible objects`,
      )
    }

    if (!dryRun && orphans.length > 0) {
      await this.storage.deleteObjects(orphans.map((object) => object.path))
      report.deleted = orphans.length
    }

    // Logged after deletion so `deleted` reflects what happened.
    console.log('[sweep]', JSON.stringify(report))

    return report
  }
}
