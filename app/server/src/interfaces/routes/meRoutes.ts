import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { MeController } from '../controllers/MeController'
import type { AppVariables } from '../http/types'
import { createAuthMiddleware } from '../middlewares/authMiddleware'

export function createMeRoutes(
  meController: MeController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)
  routes.get('/', meController.getMe)

  return routes
}
