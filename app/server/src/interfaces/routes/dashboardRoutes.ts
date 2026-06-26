import { createRoute } from '@hono/zod-openapi'
import type { SecurityService } from '../../application/services/SecurityService'
import { DashboardController } from '../controllers/DashboardController'
import { createAuthMiddleware } from '../middlewares/authMiddleware'
import { createOpenAPIRoutes, okResponse } from '../http/openapi'

export function createDashboardRoutes(
  dashboardController: DashboardController,
  securityService: SecurityService,
) {
  const routes = createOpenAPIRoutes()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.openapi(
    createRoute({
      method: 'get',
      path: '/metrics',
      responses: okResponse('Dashboard metrics for the current actor'),
    }),
    dashboardController.metrics,
  )

  return routes
}
