import type {
  IInboxSubjectMediaRepository,
  InboxSubjectMediaInsert,
} from '../../../domain/repositories/IInboxSubjectMediaRepository'
import { InboxSubjectMedia } from '../../../domain/value-objects/Media'
import { prisma } from '../../config/database'

type PrismaInboxSubjectMediaRow = NonNullable<
  Awaited<ReturnType<typeof prisma.inboxSubjectMedia.findFirst>>
>

export class PrismaInboxSubjectMediaRepository implements IInboxSubjectMediaRepository {
  async saveMany(
    inboxSubjectId: string,
    items: InboxSubjectMediaInsert[],
  ): Promise<void> {
    if (items.length === 0) return

    await prisma.inboxSubjectMedia.createMany({
      data: items.map((item) => ({
        inboxSubjectId,
        url: item.url,
        type: item.type,
        order: item.order,
        uploadedById: item.uploadedById,
        origin: item.origin,
      })),
    })
  }

  async findByInboxSubjectId(
    inboxSubjectId: string,
  ): Promise<InboxSubjectMedia[]> {
    const rows = await prisma.inboxSubjectMedia.findMany({
      where: { inboxSubjectId },
      orderBy: { order: 'asc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: PrismaInboxSubjectMediaRow): InboxSubjectMedia {
    return new InboxSubjectMedia(
      row.id,
      row.url,
      row.type,
      row.order,
      row.inboxSubjectId,
      row.uploadedById,
      row.origin,
      row.createdAt,
      row.updatedAt,
    )
  }
}
