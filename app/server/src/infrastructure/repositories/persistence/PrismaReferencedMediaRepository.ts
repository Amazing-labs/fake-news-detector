import type { IReferencedMediaRepository } from '../../../domain/repositories'
import { prisma } from '../../config/database'

// Every bucket URL still referenced by the domain.
// ⚠️ New media table? Add it to collectUrls or the sweep will delete its files.
export class PrismaReferencedMediaRepository implements IReferencedMediaRepository {
  // The single place the media tables are enumerated (undefined `where` = all).
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
