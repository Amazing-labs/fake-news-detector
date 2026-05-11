import type {
  AuthenticationResult,
  IRequestAuthenticator,
} from '../../application/services/SecurityService'
import { auth } from './betterAuth'

export class BetterAuthRequestAuthenticator implements IRequestAuthenticator {
  async authenticate(headers: Headers): Promise<AuthenticationResult> {
    const session = await auth.api.getSession({
      headers,
    })

    if (!session?.user?.actorId || !session.user.actorRole) {
      return { isValid: false }
    }

    return {
      isValid: true,
      actorId: session.user.actorId,
      role: session.user.actorRole,
      status: session.user.actorStatus ?? undefined,
    }
  }
}
