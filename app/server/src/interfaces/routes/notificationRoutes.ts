import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { NotificationController } from '../controllers/NotificationController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createNotificationRoutes(
  notificationController: NotificationController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)
  const permission = createPermissionMiddleware(
    securityService,
    'notifications.read',
  )

  routes.use('*', auth)
  routes.use('*', permission)

  routes.get('/', notificationController.list)
  routes.post('/read-all', notificationController.markAllAsRead)
  routes.post('/:notificationId/read', notificationController.markAsRead)

  return routes
}
