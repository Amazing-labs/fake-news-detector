import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { WatcherApplicationController } from '../controllers/WatcherApplicationController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import {
  createOpenAPIRoutes,
  createdResponse,
  noContentResponse,
  okResponse,
} from '../http/openapi'
import {
  applicationIdParamSchema,
  submitWatcherApplicationSchema,
} from '../http/schemas/watcherApplicationSchemas'

export function createWatcherApplicationRoutes(
  watcherApplicationController: WatcherApplicationController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      middleware: createPermissionMiddleware(
        securityService,
        'watcherApplication.decide',
      ),
      responses: okResponse('List of watcher applications'),
    }),
    watcherApplicationController.list,
  )

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/{applicationId}',
      middleware: createPermissionMiddleware(
        securityService,
        'watcherApplication.decide',
      ),
      request: { params: applicationIdParamSchema },
      responses: okResponse('Watcher application detail'),
    }),
    watcherApplicationController.getById,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/',
      middleware: createPermissionMiddleware(securityService, 'watcher.apply'),
      request: {
        body: {
          content: {
            'application/json': { schema: submitWatcherApplicationSchema },
          },
        },
      },
      responses: createdResponse('Watcher application submitted'),
    }),
    watcherApplicationController.submit,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{applicationId}/approve',
      middleware: createPermissionMiddleware(
        securityService,
        'watcherApplication.decide',
      ),
      request: { params: applicationIdParamSchema },
      responses: noContentResponse('Watcher application approved'),
    }),
    watcherApplicationController.approve,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/{applicationId}/reject',
      middleware: createPermissionMiddleware(
        securityService,
        'watcherApplication.decide',
      ),
      request: { params: applicationIdParamSchema },
      responses: noContentResponse('Watcher application rejected'),
    }),
    watcherApplicationController.reject,
  )

  return routes
}
