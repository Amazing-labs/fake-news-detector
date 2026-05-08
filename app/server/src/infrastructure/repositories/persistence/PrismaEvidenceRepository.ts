import { Evidence } from '../../../domain/entities/Evidence'
import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository'
import type { EvidenceWithMedia } from '../../../domain/processes/investigationReviewReadiness'
import { EvidenceMedia } from '../../../domain/value-objects/Media'
import { prisma } from '../../config/database'

type PrismaEvidenceRow = NonNullable<
  Awaited<ReturnType<typeof prisma.evidence.findUnique>>
>
type PrismaEvidenceMediaRow = NonNullable<
  Awaited<ReturnType<typeof prisma.evidenceMedia.findFirst>>
>

export class PrismaEvidenceRepository implements IEvidenceRepository {
  async save(evidence: Evidence): Promise<void> {
    await prisma.evidence.create({
      data: {
        id: evidence.id,
        content: evidence.content,
        title: evidence.title,
        investigationId: evidence.investigationId,
        watcherId: evidence.watcherId,
        createdAt: evidence.createdAt,
        updatedAt: evidence.updatedAt,
      },
    })
  }

  async saveWithMedia(evidence: Evidence): Promise<void> {
    await prisma.evidence.create({
      data: {
        id: evidence.id,
        content: evidence.content,
        title: evidence.title,
        investigationId: evidence.investigationId,
        watcherId: evidence.watcherId,
        createdAt: evidence.createdAt,
        updatedAt: evidence.updatedAt,
        media: {
          create: evidence.media.map((media) => ({
            url: media.url,
            type: media.type,
            order: media.order,
            uploadedById: media.uploadedById,
            category: media.category,
            reliability: media.reliability,
            justification: media.justification,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
          })),
        },
      },
    })
  }

  async findById(id: string): Promise<Evidence | null> {
    const row = await prisma.evidence.findUnique({
      where: { id },
      include: { media: true },
    })
    return row ? this.toDomain(row) : null
  }

  async findByInvestigationId(investigationId: string): Promise<Evidence[]> {
    const rows = await prisma.evidence.findMany({
      where: { investigationId },
      include: { media: true },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findWithMediaByInvestigationId(
    investigationId: string,
  ): Promise<EvidenceWithMedia[]> {
    const rows = await prisma.evidence.findMany({
      where: { investigationId },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })
    return rows.map((row) => ({
      evidence: this.toDomain(row),
      media: row.media.map((media) => this.toMediaDomain(media)),
    }))
  }

  async findByWatcherId(watcherId: string): Promise<Evidence[]> {
    const rows = await prisma.evidence.findMany({
      where: { watcherId },
      include: { media: true },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(evidence: Evidence): Promise<void> {
    await prisma.evidence.update({
      where: { id: evidence.id },
      data: {
        content: evidence.content,
        title: evidence.title,
        investigationId: evidence.investigationId,
        watcherId: evidence.watcherId,
        updatedAt: evidence.updatedAt,
      },
    })
  }

  async updateEvidenceMedia(media: EvidenceMedia): Promise<void> {
    await prisma.evidenceMedia.update({
      where: { id: media.id },
      data: {
        url: media.url,
        type: media.type,
        order: media.order,
        category: media.category,
        reliability: media.reliability,
        justification: media.justification,
        updatedAt: media.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.evidence.delete({ where: { id } })
  }

  private toDomain(
    row: PrismaEvidenceRow & { media?: PrismaEvidenceMediaRow[] },
  ): Evidence {
    return new Evidence(
      row.id,
      row.content,
      row.title,
      row.investigationId,
      row.watcherId,
      (row.media ?? []).map((media) => this.toMediaDomain(media)),
      row.createdAt,
      row.updatedAt,
    )
  }

  private toMediaDomain(row: PrismaEvidenceMediaRow): EvidenceMedia {
    return new EvidenceMedia(
      row.id,
      row.url,
      row.type,
      row.order,
      row.evidenceId,
      row.uploadedById,
      row.category ?? undefined,
      row.reliability ?? undefined,
      row.justification ?? undefined,
      row.createdAt,
      row.updatedAt,
    )
  }
}
