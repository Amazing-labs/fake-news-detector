// interfaces/middlewares/authMiddleware.ts
import type { MiddlewareHandler } from 'hono'
import {
  type Permission,
  SecurityService,
} from '../../application/services/SecurityService'
import type { AppVariables } from '../http/types'

export function createAuthMiddleware(
  securityService: SecurityService,
): MiddlewareHandler<{ Variables: AppVariables }> {
  return async (c, next) => {
    const token = c.req.header('Authorization')

    if (!token) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const auth = await securityService.authenticate(token)
    if (!auth.isValid || !auth.actorId || !auth.role) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    c.set('actor', {
      actorId: auth.actorId,
      actorRole: auth.role,
    })

    await next()
  }
}

export function createPermissionMiddleware(
  securityService: SecurityService,
  permission: Permission,
): MiddlewareHandler<{ Variables: AppVariables }> {
  return async (c, next) => {
    const actor = c.get('actor')
    if (!actor) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    if (!securityService.hasPermission(actor.actorRole, permission)) {
      return c.json({ success: false, error: 'Forbidden' }, 403)
    }

    await next()
  }
}
