import type { IReferencedMediaRepository } from '../../../domain/repositories'
import { prisma } from '../../config/database'

// Gathers every bucket URL still referenced by the domain, across all media
// tables. ⚠️ If you add a table with a media `url` column, add its query to
// `collectUrls` below — the single place that enumerates the media tables — or
// the storage sweep will delete its files as orphans.
export class PrismaReferencedMediaRepository implements IReferencedMediaRepository {
  // The one place the five media tables are enumerated. `where` scopes the
  // query: undefined = every referenced URL; `{ url: { in } }` = only the given
  // URLs. Keeping both public methods on this list removes the single-point-of-
  // failure of forgetting to update one but not the other.
  private async collectUrls(where?: {
    url: { in: string[] }
  }): Promise<string[]> {
    const [report, inbox, evidence, investigation, verified] =
      await Promise.all([
        prisma.reportMedia.findMany({ where, select: { url: true } }),
        prisma.inboxSubjectMedia.findMany({ where, select: { url: true } }),
        prisma.evidenceMedia.findMany({ where, select: { url: true } }),
        prisma.investigationMedia.findMany({ where, select: { url: true } }),
        prisma.verifiedMedia.findMany({ where, select: { url: true } }),
      ])

    return [
      ...report,
      ...inbox,
      ...evidence,
      ...investigation,
      ...verified,
    ].map((row) => row.url)
  }

  async listReferencedMediaUrls(): Promise<string[]> {
    return this.collectUrls()
  }

  async filterReferencedUrls(urls: string[]): Promise<string[]> {
    if (urls.length === 0) return []
    return this.collectUrls({ url: { in: urls } })
  }
}
