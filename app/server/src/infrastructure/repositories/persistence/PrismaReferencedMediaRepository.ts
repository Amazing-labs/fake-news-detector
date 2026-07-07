import type { IReferencedMediaRepository } from '../../../domain/repositories'
import { prisma } from '../../config/database'

// Gathers every bucket URL still referenced by the domain, across all media
// tables. ⚠️ If you add a table with a media `url` column, add its query here or
// the storage sweep will delete its files as orphans. This is the single source
// of truth the sweep relies on.
export class PrismaReferencedMediaRepository implements IReferencedMediaRepository {
  async listReferencedMediaUrls(): Promise<string[]> {
    const [report, inbox, evidence, investigation, verified] =
      await Promise.all([
        prisma.reportMedia.findMany({ select: { url: true } }),
        prisma.inboxSubjectMedia.findMany({ select: { url: true } }),
        prisma.evidenceMedia.findMany({ select: { url: true } }),
        prisma.investigationMedia.findMany({ select: { url: true } }),
        prisma.verifiedMedia.findMany({ select: { url: true } }),
      ])

    return [
      ...report,
      ...inbox,
      ...evidence,
      ...investigation,
      ...verified,
    ].map((row) => row.url)
  }

  async filterReferencedUrls(urls: string[]): Promise<string[]> {
    if (urls.length === 0) return []

    const [report, inbox, evidence, investigation, verified] =
      await Promise.all([
        prisma.reportMedia.findMany({
          where: { url: { in: urls } },
          select: { url: true },
        }),
        prisma.inboxSubjectMedia.findMany({
          where: { url: { in: urls } },
          select: { url: true },
        }),
        prisma.evidenceMedia.findMany({
          where: { url: { in: urls } },
          select: { url: true },
        }),
        prisma.investigationMedia.findMany({
          where: { url: { in: urls } },
          select: { url: true },
        }),
        prisma.verifiedMedia.findMany({
          where: { url: { in: urls } },
          select: { url: true },
        }),
      ])

    return [
      ...report,
      ...inbox,
      ...evidence,
      ...investigation,
      ...verified,
    ].map((row) => row.url)
  }
}
