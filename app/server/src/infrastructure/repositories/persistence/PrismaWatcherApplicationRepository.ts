import { Prisma } from '@prisma/client'
import { WatcherApplication } from '../../../domain/entities/WatcherApplication'
import type { IWatcherApplicationRepository } from '../../../domain/repositories/IWatcherApplicationRepository'
import { BusinessRuleError } from '../../../shared/errors'
import { prisma } from '../../config/database'

type PrismaWatcherApplicationRow = NonNullable<
  Awaited<ReturnType<typeof prisma.watcherApplication.findUnique>>
>

export class PrismaWatcherApplicationRepository implements IWatcherApplicationRepository {
  async save(application: WatcherApplication): Promise<void> {
    try {
      await prisma.watcherApplication.create({
        data: {
          id: application.id,
          actorId: application.actorId,
          motivation: application.motivation,
          status: application.status,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt,
        },
      })
    } catch (error) {
      // The partial unique index (one active application per actor) is the race
      // safety net behind the service-level check. Translate its violation into
      // a clean business error instead of leaking a raw 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BusinessRuleError(
          'A watcher application is already pending or approved for this citizen',
        )
      }
      throw error
    }
  }

  async updateWatcherApplicationStatus(
    _adminId: string,
    applicationId: string,
    status: WatcherApplication['status'],
  ): Promise<void> {
    await prisma.watcherApplication.update({
      where: { id: applicationId },
      data: { status },
    })
  }

  async findWatcherApplicationById(
    id: string,
  ): Promise<WatcherApplication | null> {
    const row = await prisma.watcherApplication.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByActorId(actorId: string): Promise<WatcherApplication[]> {
    const rows = await prisma.watcherApplication.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findAll(): Promise<WatcherApplication[]> {
    const rows = await prisma.watcherApplication.findMany()
    return rows.map((row) => this.toDomain(row))
  }

  private toDomain(row: PrismaWatcherApplicationRow): WatcherApplication {
    return new WatcherApplication(
      row.id,
      row.actorId,
      row.motivation,
      row.status,
      row.createdAt,
      row.updatedAt,
    )
  }
}
