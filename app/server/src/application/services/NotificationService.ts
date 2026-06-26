// application/services/NotificationService.ts
//
// Application service for the per-actor notification inbox. Controllers delegate
// here so the interface layer never touches the repository directly.

import type { INotificationRepository } from '../../domain/repositories'
import type { Notification } from '../../domain/entities/Notification'
import { NotFoundError } from '../../shared/errors'

export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async listForActor(
    actorId: string,
    activeOnly: boolean,
  ): Promise<Notification[]> {
    return activeOnly
      ? this.notificationRepository.findActiveByActorId(actorId)
      : this.notificationRepository.findByActorId(actorId)
  }

  async markAsRead(actorId: string, notificationId: string): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId)
    if (!notification || notification.actorId !== actorId) {
      throw new NotFoundError('Notification', notificationId)
    }
    await this.notificationRepository.markAsRead(notificationId)
  }

  async markAllAsRead(actorId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(actorId)
  }
}
