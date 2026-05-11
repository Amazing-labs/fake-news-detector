import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { WatcherApplicationController } from '../controllers/WatcherApplicationController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createWatcherApplicationRoutes(
  watcherApplicationController: WatcherApplicationController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.get(
    '/',
    createPermissionMiddleware(securityService, 'watcherApplication.decide'),
    watcherApplicationController.list,
  )
  routes.post(
    '/',
    createPermissionMiddleware(securityService, 'watcher.apply'),
    watcherApplicationController.submit,
  )
  routes.post(
    '/:applicationId/approve',
    createPermissionMiddleware(securityService, 'watcherApplication.decide'),
    watcherApplicationController.approve,
  )
  routes.post(
    '/:applicationId/reject',
    createPermissionMiddleware(securityService, 'watcherApplication.decide'),
    watcherApplicationController.reject,
  )

  return routes
}
