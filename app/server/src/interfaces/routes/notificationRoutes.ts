import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { NotificationController } from '../controllers/NotificationController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  noContentResponse,
  okResponse,
} from '../http/openapi'
import { notificationIdParamSchema } from '../http/schemas/notificationSchemas'

export function createNotificationRoutes(
  notificationController: NotificationController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)
  const permission = createPermissionMiddleware(
    securityService,
    'notifications.read',
  )

  routes.use('*', auth)
  routes.use('*', permission)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: okResponse('List of notifications'),
    }),
    notificationController.list,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/read-all',
      responses: noContentResponse('All notifications marked as read'),
    }),
    notificationController.markAllAsRead,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{notificationId}/read',
      request: { params: notificationIdParamSchema },
      responses: noContentResponse('Notification marked as read'),
    }),
    notificationController.markAsRead,
  )

  return routes
}
