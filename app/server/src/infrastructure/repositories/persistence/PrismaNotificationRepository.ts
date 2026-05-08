import { Notification } from '../../../domain/entities/Notification'
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository'
import { prisma } from '../../config/database'

type PrismaNotificationRow = NonNullable<
  Awaited<ReturnType<typeof prisma.notification.findUnique>>
>

export class PrismaNotificationRepository implements INotificationRepository {
  async save(notification: Notification): Promise<void> {
    await prisma.notification.create({
      data: {
        id: notification.id,
        type: notification.type,
        theme: notification.theme,
        message: notification.message,
        actorId: notification.actorId,
        isRead: notification.isRead,
        publicationId: notification.publicationId,
        investigationId: notification.investigationId,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      },
    })
  }

  async saveMany(notifications: Notification[]): Promise<void> {
    if (notifications.length === 0) return
    await prisma.notification.createMany({
      data: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        theme: notification.theme,
        message: notification.message,
        actorId: notification.actorId,
        isRead: notification.isRead,
        publicationId: notification.publicationId,
        investigationId: notification.investigationId,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      })),
    })
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await prisma.notification.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByActorId(
    actorId: string,
    options?: { skip?: number; take?: number; activeOnly?: boolean },
  ): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({
      where: {
        actorId,
        ...(options?.activeOnly ? { isRead: false } : {}),
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map((row) => this.toDomain(row))
  }

  async findActiveByActorId(actorId: string): Promise<Notification[]> {
    return this.findByActorId(actorId, { activeOnly: true })
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async markAllAsRead(actorId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        actorId,
        isRead: false,
      },
      data: { isRead: true },
    })
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const result = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return result.count
  }

  async countActiveByActorId(actorId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        actorId,
        isRead: false,
      },
    })
  }

  async count(): Promise<number> {
    return prisma.notification.count()
  }

  private toDomain(row: PrismaNotificationRow): Notification {
    return new Notification(
      row.id,
      row.type,
      row.theme,
      row.message,
      row.actorId,
      row.isRead,
      row.createdAt,
      row.updatedAt,
      row.publicationId ?? undefined,
      row.investigationId ?? undefined,
    )
  }
}
