import type { Context } from 'hono'
import type { INotificationRepository } from '../../domain/repositories'
import { NotFoundError } from '../../shared/errors'
import { noContent, ok } from '../http/responses'
import { requiredParam } from '../http/request'
import type { AppVariables } from '../http/types'
import { presentNotificationList } from '../presenters/notificationPresenter'

export class NotificationController {
  constructor(
    private readonly notificationRepository: INotificationRepository,
  ) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const activeOnly = c.req.query('activeOnly') === 'true'
    const notifications = activeOnly
      ? await this.notificationRepository.findActiveByActorId(actor.actorId)
      : await this.notificationRepository.findByActorId(actor.actorId)

    return ok(c, presentNotificationList(notifications))
  }

  markAsRead = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const notificationId = requiredParam(c, 'notificationId')
    const notification =
      await this.notificationRepository.findById(notificationId)

    if (!notification || notification.actorId !== actor.actorId) {
      throw new NotFoundError('Notification', notificationId)
    }

    await this.notificationRepository.markAsRead(notificationId)
    return noContent(c)
  }

  markAllAsRead = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.notificationRepository.markAllAsRead(actor.actorId)
    return noContent(c)
  }
}
