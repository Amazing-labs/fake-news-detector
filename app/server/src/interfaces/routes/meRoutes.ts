import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { MeController } from '../controllers/MeController'
import { createAuthMiddleware } from '../middlewares/authMiddleware'
import { createOpenAPIRoutes, okResponse } from '../http/openapi'

export function createMeRoutes(
  meController: MeController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/',
      responses: okResponse('Current actor profile'),
    }),
    meController.getMe,
  )

  return routes
}
