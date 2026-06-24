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

  routes.post(
    '/citizens/:citizenId/ban',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    directorController.banCitizen,
  )

  routes.post(
    '/citizens/:citizenId/disable',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    directorController.disableCitizen,
  )

  routes.post(
    '/citizens/:citizenId/activate',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    directorController.activateCitizen,
  )

  return routes
}
