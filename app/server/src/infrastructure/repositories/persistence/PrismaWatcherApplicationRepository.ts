import { WatcherApplication } from '../../../domain/entities/WatcherApplication'
import type { IWatcherApplicationRepository } from '../../../domain/repositories/IWatcherApplicationRepository'
import { prisma } from '../../config/database'

type PrismaWatcherApplicationRow = NonNullable<
  Awaited<ReturnType<typeof prisma.watcherApplication.findUnique>>
>

export class PrismaWatcherApplicationRepository implements IWatcherApplicationRepository {
  async save(application: WatcherApplication): Promise<void> {
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
