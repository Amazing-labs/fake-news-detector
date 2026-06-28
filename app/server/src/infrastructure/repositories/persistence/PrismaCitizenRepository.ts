import {
  Citizen,
  type CitizenStatus,
  type CitizenType,
} from '../../../domain/entities/Citizen'
import type { ICitizenRepository } from '../../../domain/repositories/ICitizenRepository'
import { MAX_REPORTING_PER_CITIZEN_AT_A_TIME } from '../../../shared/constants'
import { prisma } from '../../config/database'

type PrismaCitizenRow = NonNullable<
  Awaited<ReturnType<typeof prisma.actor.findUnique>>
>

export class PrismaCitizenRepository implements ICitizenRepository {
  async save(citizen: Citizen): Promise<void> {
    await prisma.actor.create({
      data: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        status: citizen.status,
        citizenType: citizen.citizenType,
        engagementScore: citizen.engagementScore,
        lastInboxRead: citizen.lastInboxRead,
        openReportsCount: citizen.openReportsCount,
        statusReason: citizen.statusReason,
        statusReasonDetails: citizen.statusReasonDetails,
        createdAt: citizen.createdAt,
        updatedAt: citizen.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Citizen | null> {
    const row = await prisma.actor.findUnique({
      where: { id },
    })
    return row ? this.toDomain(row) : null
  }

  async findByIds(ids: string[]): Promise<Citizen[]> {
    if (ids.length === 0) return []
    const rows = await prisma.actor.findMany({
      where: { role: 'CITIZEN', id: { in: ids } },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByEmail(email: string): Promise<Citizen | null> {
    const row = await prisma.actor.findUnique({
      where: { email },
    })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<Citizen[]> {
    const rows = await prisma.actor.findMany({
      where: { role: 'CITIZEN' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findAllIds(): Promise<string[]> {
    const rows = await prisma.actor.findMany({
      where: { role: 'CITIZEN' },
      select: { id: true },
    })
    return rows.map((row) => row.id)
  }

  async findByStatus(status: CitizenStatus): Promise<Citizen[]> {
    const rows = await prisma.actor.findMany({
      where: {
        role: 'CITIZEN',
        status,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findByCitizenType(type: CitizenType): Promise<Citizen[]> {
    const rows = await prisma.actor.findMany({
      where: {
        role: 'CITIZEN',
        citizenType: type,
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(citizen: Citizen): Promise<void> {
    await prisma.actor.update({
      where: { id: citizen.id },
      data: {
        name: citizen.name,
        email: citizen.email,
        role: citizen.role,
        status: citizen.status,
        citizenType: citizen.citizenType,
        engagementScore: citizen.engagementScore,
        lastInboxRead: citizen.lastInboxRead,
        openReportsCount: citizen.openReportsCount,
        statusReason: citizen.statusReason,
        statusReasonDetails: citizen.statusReasonDetails,
        updatedAt: citizen.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.actor.delete({
      where: { id },
    })
  }

  private toDomain(row: PrismaCitizenRow): Citizen {
    return new Citizen(
      row.id,
      row.name,
      row.email,
      row.role,
      row.status,
      row.citizenType,
      row.engagementScore,
      row.lastInboxRead,
      row.openReportsCount,
      MAX_REPORTING_PER_CITIZEN_AT_A_TIME,
      row.statusReason,
      row.statusReasonDetails,
      row.createdAt,
      row.updatedAt,
    )
  }
}
