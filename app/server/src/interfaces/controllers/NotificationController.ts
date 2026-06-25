import type { Context } from 'hono'
import { NotificationService } from '../../application/services/NotificationService'
import { noContent, ok } from '../http/responses'
import { requiredParam } from '../http/request'
import type { AppVariables } from '../http/types'
import { presentNotificationList } from '../presenters/notificationPresenter'

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  list = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    const activeOnly = c.req.query('activeOnly') === 'true'
    const notifications = await this.notificationService.listForActor(
      actor.actorId,
      activeOnly,
    )
    return ok(c, presentNotificationList(notifications))
  }

  markAsRead = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.notificationService.markAsRead(
      actor.actorId,
      requiredParam(c, 'notificationId'),
    )
    return noContent(c)
  }

  markAllAsRead = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')
    await this.notificationService.markAllAsRead(actor.actorId)
    return noContent(c)
  }
}
