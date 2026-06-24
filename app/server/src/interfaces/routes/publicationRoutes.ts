import { Hono } from 'hono'
import type { SecurityService } from '../../application/services/SecurityService'
import { PublicationController } from '../controllers/PublicationController'
import type { AppVariables } from '../http/types'
import {
  createAuthMiddleware,
  createPermissionMiddleware,
} from '../middlewares/authMiddleware'

export function createPublicationRoutes(
  publicationController: PublicationController,
  securityService: SecurityService,
) {
  const routes = new Hono<{ Variables: AppVariables }>()
  const auth = createAuthMiddleware(securityService)

  routes.use('*', auth)

  routes.get('/', publicationController.list)
  routes.get('/:publicationId', publicationController.getById)
  routes.get(
    '/:publicationId/corrections',
    publicationController.listCorrections,
  )
  routes.post(
    '/:publicationId/corrections',
    createPermissionMiddleware(securityService, 'publication.correct'),
    publicationController.publishCorrection,
  )

  return routes
}
