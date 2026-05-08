import type {
  IReportMediaRepository,
  ReportMediaInsert,
} from '../../../domain/repositories/IReportMediaRepository'
import { ReportMedia } from '../../../domain/value-objects/Media'
import { prisma } from '../../config/database'

type PrismaReportMediaRow = NonNullable<
  Awaited<ReturnType<typeof prisma.reportMedia.findFirst>>
>

export class PrismaReportMediaRepository implements IReportMediaRepository {
  async saveMany(reportId: string, items: ReportMediaInsert[]): Promise<void> {
    if (items.length === 0) return

    await prisma.reportMedia.createMany({
      data: items.map((item) => ({
        reportId,
        url: item.url,
        type: item.type,
        order: item.order,
        uploadedById: item.uploadedById,
      })),
    })
  }

  async findByReportId(reportId: string): Promise<ReportMedia[]> {
    const rows = await prisma.reportMedia.findMany({
      where: { reportId },
      orderBy: { order: 'asc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: PrismaReportMediaRow): ReportMedia {
    return new ReportMedia(
      row.id,
      row.url,
      row.type,
      row.order,
      row.reportId,
      row.uploadedById,
      row.createdAt,
      row.updatedAt,
    )
  }
}
