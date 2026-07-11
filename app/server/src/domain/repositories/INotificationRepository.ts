import { Notification } from '../entities/Notification'

export interface INotificationRepository {
  save(notification: Notification): Promise<void>
  saveMany(notifications: Notification[]): Promise<void>
  findById(id: string): Promise<Notification | null>
  findByActorId(
    actorId: string,
    options?: {
      skip?: number
      take?: number
      activeOnly?: boolean
    },
  ): Promise<Notification[]>
  findActiveByActorId(actorId: string): Promise<Notification[]>
  markAsRead(id: string): Promise<void>
  markAllAsRead(actorId: string): Promise<void>
  deleteOlderThan(days: number): Promise<number>
  countActiveByActorId(actorId: string): Promise<number>
  count(): Promise<number>
}
