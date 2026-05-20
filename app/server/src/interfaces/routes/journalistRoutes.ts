import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { JournalistManagementController } from '../controllers/JournalistManagementController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createJournalistRoutes(
  journalistManagementController: JournalistManagementController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.get(
    '/',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    journalistManagementController.list,
  )
  routes.post(
    '/',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    journalistManagementController.create,
  )
  routes.post(
    '/:journalistId/ban',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    journalistManagementController.ban,
  )
  routes.post(
    '/:journalistId/disable',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    journalistManagementController.disable,
  )
  routes.post(
    '/:journalistId/activate',
    createPermissionMiddleware(securityService, 'journalist.manage'),
    journalistManagementController.activate,
  )

  return routes
}
