import { Publication } from '../../../domain/entities/Publication'
import type { IPublicationRepository } from '../../../domain/repositories/IPublicationRepository'
import {
  VerifiedLink,
  VerifiedMedia,
} from '../../../domain/value-objects/Media'
import { prisma } from '../../config/database'

type PrismaPublicationRow = NonNullable<
  Awaited<ReturnType<typeof prisma.publication.findUnique>>
>
type PrismaVerifiedMediaRow = NonNullable<
  Awaited<ReturnType<typeof prisma.verifiedMedia.findFirst>>
>
type PrismaVerifiedLinkRow = NonNullable<
  Awaited<ReturnType<typeof prisma.verifiedLink.findFirst>>
>

export class PrismaPublicationRepository implements IPublicationRepository {
  async save(publication: Publication): Promise<void> {
    await prisma.publication.create({
      data: {
        id: publication.id,
        investigationId: publication.investigationId,
        approvedById: publication.approvedById,
        finalVerdict: publication.finalVerdict,
        publishedAt: publication.publishedAt,
        isCorrection: publication.isCorrection,
        createdAt: publication.createdAt,
        updatedAt: publication.updatedAt,
        verifiedMedia: {
          create: publication.verifiedMedia.map((media) => ({
            url: media.url,
            type: media.type,
            order: media.order,
            addedById: media.addedById,
            authoritySourceId: media.authoritySourceId,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
          })),
        },
        verifiedLinks: {
          create: publication.verifiedLinks.map((link) => ({
            url: link.url,
            addedById: link.addedById,
            authoritySourceId: link.authoritySourceId,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt,
          })),
        },
      },
    })
  }

  async markAsCorrected(publicationId: string, updatedAt: Date): Promise<void> {
    await prisma.publication.update({
      where: { id: publicationId },
      data: {
        isCorrection: true,
        updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Publication | null> {
    const row = await prisma.publication.findUnique({
      where: { id },
      include: {
        verifiedMedia: { orderBy: { order: 'asc' } },
        verifiedLinks: true,
      },
    })
    return row ? this.toDomain(row) : null
  }

  async findByInvestigationId(
    investigationId: string,
  ): Promise<Publication | null> {
    const row = await prisma.publication.findUnique({
      where: { investigationId },
      include: {
        verifiedMedia: { orderBy: { order: 'asc' } },
        verifiedLinks: true,
      },
    })
    return row ? this.toDomain(row) : null
  }

  async findAll(options?: {
    skip?: number
    take?: number
    orderBy?: 'asc' | 'desc'
  }): Promise<Publication[]> {
    const rows = await prisma.publication.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { publishedAt: options?.orderBy ?? 'desc' },
      include: {
        verifiedMedia: { orderBy: { order: 'asc' } },
        verifiedLinks: true,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByApproverId(approvedById: string): Promise<Publication[]> {
    const rows = await prisma.publication.findMany({
      where: { approvedById },
      include: {
        verifiedMedia: { orderBy: { order: 'asc' } },
        verifiedLinks: true,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findCorrections(): Promise<Publication[]> {
    const rows = await prisma.publication.findMany({
      where: { isCorrection: true },
      include: {
        verifiedMedia: { orderBy: { order: 'asc' } },
        verifiedLinks: true,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async delete(id: string): Promise<void> {
    await prisma.publication.delete({ where: { id } })
  }

  async count(): Promise<number> {
    return prisma.publication.count()
  }

  private toDomain(
    row: PrismaPublicationRow & {
      verifiedMedia?: PrismaVerifiedMediaRow[]
      verifiedLinks?: PrismaVerifiedLinkRow[]
    },
  ): Publication {
    return new Publication(
      row.id,
      row.investigationId,
      row.approvedById,
      row.finalVerdict,
      row.publishedAt,
      row.isCorrection,
      (row.verifiedLinks ?? []).map((link) => this.toVerifiedLinkDomain(link)),
      (row.verifiedMedia ?? []).map((media) =>
        this.toVerifiedMediaDomain(media),
      ),
      row.createdAt,
      row.updatedAt,
    )
  }

  private toVerifiedMediaDomain(row: PrismaVerifiedMediaRow): VerifiedMedia {
    return new VerifiedMedia(
      row.id,
      row.url,
      row.type,
      row.order,
      row.publicationId,
      row.addedById,
      row.authoritySourceId ?? undefined,
      row.createdAt,
      row.updatedAt,
    )
  }

  private toVerifiedLinkDomain(row: PrismaVerifiedLinkRow): VerifiedLink {
    return new VerifiedLink(
      row.id,
      row.url,
      row.publicationId,
      row.addedById,
      row.authoritySourceId ?? undefined,
      row.createdAt,
      row.updatedAt,
    )
  }
}
