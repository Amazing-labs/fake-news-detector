import { Correction, type ICorrectionRepository } from '../../../domain'
import { prisma } from '../../config/database'
import { Correction as PrismaCorrectionRow } from '@prisma/client'

export class PrismaCorrectionRepository implements ICorrectionRepository {
  async save(correction: Correction): Promise<void> {
    await prisma.correction.create({
      data: {
        id: correction.id,
        notificationId: correction.notificationId,
        publicationId: correction.publicationId,
        title: correction.title,
        content: correction.content,
        correctedById: correction.correctedById,
        createdAt: correction.createdAt,
        updatedAt: correction.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Correction | null> {
    const rows = await prisma.correction.findUnique({
      where: {
        id,
      },
    })

    return rows ? this.toDomain(rows) : null
  }

  async findByNotificationId(
    notificationId: string,
  ): Promise<Correction | null> {
    const rows = await prisma.correction.findUnique({
      where: {
        notificationId,
      },
    })

    return rows ? this.toDomain(rows) : null
  }

  async findByPublicationId(publicationId: string): Promise<Correction[]> {
    const rows = await prisma.correction.findMany({
      where: {
        publicationId,
      },
    })

    return rows.map((r) => this.toDomain(r))
  }

  async findByPublicationIds(publicationIds: string[]): Promise<Correction[]> {
    if (publicationIds.length === 0) return []
    const rows = await prisma.correction.findMany({
      where: {
        publicationId: { in: publicationIds },
      },
    })

    return rows.map((r) => this.toDomain(r))
  }

  async findByCorrectedBy(correctedById: string): Promise<Correction[]> {
    const rows = await prisma.correction.findMany({
      where: {
        correctedById,
      },
    })

    return rows.map((r) => this.toDomain(r))
  }

  async update(correction: Correction): Promise<void> {
    await prisma.correction.update({
      where: {
        id: correction.id,
      },
      data: {
        notificationId: correction.notificationId,
        publicationId: correction.publicationId,
        title: correction.title,
        content: correction.content,
        correctedById: correction.correctedById,
        updatedAt: correction.updatedAt,
      },
    })
  }
  async delete(id: string): Promise<void> {
    await prisma.correction.delete({
      where: {
        id,
      },
    })
  }

  private toDomain(row: PrismaCorrectionRow): Correction {
    return new Correction(
      row.id,
      row.notificationId,
      row.publicationId,
      row.title,
      row.content,
      row.correctedById,
      row.createdAt,
      row.updatedAt,
    )
  }
}
