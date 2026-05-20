import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { DirectorController } from '../controllers/DirectorController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createDirectorRoutes(
  directorController: DirectorController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.get(
    '/dashboard',
    createPermissionMiddleware(securityService, 'director.dashboard.read'),
    directorController.getDashboard,
  )

  routes.get(
    '/citizens',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    directorController.listCitizens,
  )

  return routes
}
