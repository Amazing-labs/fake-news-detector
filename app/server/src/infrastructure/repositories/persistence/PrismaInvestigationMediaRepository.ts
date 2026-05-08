import type { IInvestigationMediaRepository } from '../../../domain/repositories/IInvestigationMediaRepository'
import { InvestigationMedia } from '../../../domain/value-objects/Media'
import { prisma } from '../../config/database'

type PrismaInvestigationMediaRow = NonNullable<
  Awaited<ReturnType<typeof prisma.investigationMedia.findFirst>>
>

export class PrismaInvestigationMediaRepository implements IInvestigationMediaRepository {
  async saveMany(
    investigationId: string,
    items: InvestigationMedia[],
  ): Promise<void> {
    if (items.length === 0) return

    await prisma.investigationMedia.createMany({
      data: items.map((item) => ({
        investigationId,
        url: item.url,
        type: item.type,
        order: item.order,
        origin: item.origin,
        category: item.category,
        reliability: item.reliability,
        justification: item.justification,
        authoritySourceId: item.authoritySourceId,
        uploadedById: item.uploadedById,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    })
  }

  async findByInvestigationId(
    investigationId: string,
  ): Promise<InvestigationMedia[]> {
    const rows = await prisma.investigationMedia.findMany({
      where: { investigationId },
      orderBy: { order: 'asc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(media: InvestigationMedia): Promise<void> {
    await prisma.investigationMedia.update({
      where: { id: media.id },
      data: {
        url: media.url,
        type: media.type,
        order: media.order,
        origin: media.origin,
        category: media.category,
        reliability: media.reliability,
        justification: media.justification,
        authoritySourceId: media.authoritySourceId,
        uploadedById: media.uploadedById,
        updatedAt: media.updatedAt,
      },
    })
  }

  private toDomain(row: PrismaInvestigationMediaRow): InvestigationMedia {
    return new InvestigationMedia(
      row.id,
      row.url,
      row.type,
      row.order,
      row.origin,
      row.investigationId,
      row.uploadedById,
      row.category ?? undefined,
      row.reliability ?? undefined,
      row.justification ?? undefined,
      row.authoritySourceId ?? undefined,
      row.createdAt,
      row.updatedAt,
    )
  }
}
