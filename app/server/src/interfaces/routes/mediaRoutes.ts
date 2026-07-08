import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { MediaController } from '../controllers/MediaController'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'
import { createOpenAPIRoutes, jsonBody, okResponse } from '../http/openapi'
import {
  mediaCleanupSchema,
  mediaSweepSchema,
} from '../http/schemas/mediaSchemas'

export function createMediaRoutes(
  mediaController: MediaController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/cleanup',
      request: { body: jsonBody(mediaCleanupSchema) },
      responses: okResponse('Cleanup result'),
    }),
    mediaController.cleanup,
  )

  routes.openapi(
    createRoute({
      method: 'post',
      path: '/sweep',
      middleware: createPermissionMiddleware(securityService, 'storage.sweep'),
      request: { body: jsonBody(mediaSweepSchema) },
      responses: okResponse('Sweep report'),
    }),
    mediaController.sweep,
  )

  return routes
}
