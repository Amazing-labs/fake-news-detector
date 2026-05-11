import type {
  AuthenticationResult,
  ITokenVerifier,
} from '../../application/services/SecurityService'
import type { ActorRole } from '../../shared/types'

const ACTOR_ROLES: ActorRole[] = ['CITIZEN', 'JOURNALIST', 'EDITORIAL_DIRECTOR']

export class SimpleTokenVerifier implements ITokenVerifier {
  async verify(token: string): Promise<AuthenticationResult> {
    const rawToken = token.replace(/^Bearer\s+/i, '').trim()
    if (!rawToken) {
      return { isValid: false }
    }

    const [actorId, role] = rawToken.split(':', 2)
    if (!actorId || !role || !ACTOR_ROLES.includes(role as ActorRole)) {
      return { isValid: false }
    }

    return {
      isValid: true,
      actorId,
      role: role as ActorRole,
    }
  }
}
