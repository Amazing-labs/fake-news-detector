import { Director } from '../../../domain/entities/Director'
import type { IDirectorRepository } from '../../../domain/repositories/IDirectorRepository'
import { prisma } from '../../config/database'

type PrismaDirectorRow = NonNullable<
  Awaited<ReturnType<typeof prisma.actor.findUnique>>
>

export class PrismaDirectorRepository implements IDirectorRepository {
  async save(director: Director): Promise<void> {
    await prisma.actor.create({
      data: {
        id: director.id,
        name: director.name,
        email: director.email,
        status: director.status,
        role: director.role,
        lastInboxRead: director.lastInboxRead,
        engagementScore: director.scoreInvestigation,
        createdAt: director.createdAt,
        updatedAt: director.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Director | null> {
    const row = await prisma.actor.findUnique({
      where: { id },
    })
    return row ? this.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<Director | null> {
    const row = await prisma.actor.findUnique({
      where: { email },
    })
    return row ? this.toDomain(row) : null
  }

  async findActive(): Promise<Director | null> {
    const row = await prisma.actor.findFirst({
      where: {
        role: 'EDITORIAL_DIRECTOR',
        status: 'ACTIVE',
      },
    })
    return row ? this.toDomain(row) : null
  }

  async findAll(): Promise<Director[]> {
    const rows = await prisma.actor.findMany({
      where: {
        role: 'EDITORIAL_DIRECTOR',
      },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async update(director: Director): Promise<void> {
    await prisma.actor.update({
      where: { id: director.id },
      data: {
        name: director.name,
        email: director.email,
        status: director.status,
        role: director.role,
        lastInboxRead: director.lastInboxRead,
        engagementScore: director.scoreInvestigation,
        updatedAt: director.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.actor.delete({
      where: { id },
    })
  }

  private toDomain(row: PrismaDirectorRow): Director {
    return new Director(
      row.id,
      row.name,
      row.email,
      row.status,
      row.role,
      row.lastInboxRead,
      row.engagementScore,
      row.createdAt,
      row.updatedAt,
    )
  }
}
