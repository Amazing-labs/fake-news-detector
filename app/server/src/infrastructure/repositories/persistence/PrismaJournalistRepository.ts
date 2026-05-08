import { Journalist } from '../../../domain/entities/Journalist'
import type { IJournalistRepository } from '../../../domain/repositories/IJournalistRepository'
import { MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME } from '../../../shared/constants'
import { prisma } from '../../config/database'

type PrismaJournalistRow = NonNullable<
  Awaited<ReturnType<typeof prisma.actor.findUnique>>
>

export class PrismaJournalistRepository implements IJournalistRepository {
  async save(journalist: Journalist): Promise<void> {
    await prisma.actor.create({
      data: {
        id: journalist.id,
        name: journalist.name,
        email: journalist.email,
        role: journalist.role,
        status: journalist.status,
        engagementScore: journalist.engagementScore,
        lastInboxRead: journalist.lastInboxRead,
        activeInvestigationsCount: journalist.activeInvestigationsCount,
        statusReason: journalist.statusReason,
        statusReasonDetails: journalist.statusReasonDetails,
        createdAt: journalist.createdAt,
        updatedAt: journalist.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Journalist | null> {
    const row = await prisma.actor.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<Journalist | null> {
    const row = await prisma.actor.findUnique({ where: { email } })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<Journalist[]> {
    const rows = await prisma.actor.findMany({
      where: { role: 'JOURNALIST' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByStatus(status: string): Promise<Journalist[]> {
    const rows = await prisma.actor.findMany({
      where: {
        role: 'JOURNALIST',
        status: status as PrismaJournalistRow['status'],
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findAvailable(): Promise<Journalist[]> {
    const rows = await prisma.actor.findMany({
      where: {
        role: 'JOURNALIST',
        status: 'ACTIVE',
      },
    })
    return rows
      .map((row) => this.toDomain(row))
      .filter((journalist) => journalist.canAnalyze())
  }

  async update(journalist: Journalist): Promise<void> {
    await prisma.actor.update({
      where: { id: journalist.id },
      data: {
        name: journalist.name,
        email: journalist.email,
        role: journalist.role,
        status: journalist.status,
        engagementScore: journalist.engagementScore,
        lastInboxRead: journalist.lastInboxRead,
        activeInvestigationsCount: journalist.activeInvestigationsCount,
        statusReason: journalist.statusReason,
        statusReasonDetails: journalist.statusReasonDetails,
        updatedAt: journalist.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.actor.delete({
      where: { id },
    })
  }

  private toDomain(row: PrismaJournalistRow): Journalist {
    return new Journalist(
      row.id,
      row.name,
      row.email,
      row.role,
      row.status,
      row.engagementScore,
      row.lastInboxRead,
      row.activeInvestigationsCount,
      MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME,
      row.statusReason,
      row.statusReasonDetails,
      row.createdAt,
      row.updatedAt,
    )
  }
}
