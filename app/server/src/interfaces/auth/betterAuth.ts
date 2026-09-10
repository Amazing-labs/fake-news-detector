import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession } from 'better-auth/plugins'
import { prisma } from '../../infrastructure/config/database'
import { hasProcessEnv, readProcessEnv } from '../../shared'
import {
  provisionCitizenActorForAuthUser,
  resolveSessionActorForAuthUser,
} from './authLinking'
import { hashWorkerPassword, verifyWorkerPassword } from './passwordHashing'
import { readTrustedOrigins } from './trustedOrigins'

const DEFAULT_SECRET = 'development-better-auth-secret-please-change-me'
const DEFAULT_BASE_URL = 'http://localhost:3000/api/auth'

function logBetterAuthDebug(
  message: string,
  details?: Record<string, unknown>,
): void {
  console.log(
    '[BetterAuthDebug]',
    message,
    details ? JSON.stringify(details) : '',
  )
}

function logBetterAuthError(
  message: string,
  error: unknown,
  details?: Record<string, unknown>,
): void {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { value: String(error) }

  console.error(
    '[BetterAuthDebug]',
    message,
    JSON.stringify({
      ...details,
      error: normalizedError,
    }),
  )
}

function isProduction(): boolean {
  const nodeEnv = readProcessEnv('NODE_ENV')
  return (
    nodeEnv === 'production' || (!hasProcessEnv() && nodeEnv !== 'development')
  )
}

function resolveBetterAuthSecret(): string {
  const secret = readProcessEnv('BETTER_AUTH_SECRET') ?? DEFAULT_SECRET

  if (isProduction() && secret === DEFAULT_SECRET) {
    throw new Error(
      'BETTER_AUTH_SECRET must be set in production. Refusing to use the default development secret.',
    )
  }

  return secret
}

export const auth = betterAuth({
  secret: resolveBetterAuthSecret(),
  baseURL: readProcessEnv('BETTER_AUTH_URL') ?? DEFAULT_BASE_URL,
  trustedOrigins: readTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: isProduction()
      ? undefined
      : async ({ url }) => {
          console.log(
            `[BetterAuthDebug] Password reset URL (development only): ${url}`,
          )
        },
    password: {
      hash: hashWorkerPassword,
      verify: verifyWorkerPassword,
    },
  },
  advanced: {
    cookiePrefix: 'fake-news-detector',
    useSecureCookies: isProduction(),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          logBetterAuthDebug('databaseHooks.user.create.after:start', {
            userId: user.id,
            email: user.email,
          })

          try {
            await provisionCitizenActorForAuthUser(user)
            logBetterAuthDebug('databaseHooks.user.create.after:success', {
              userId: user.id,
              email: user.email,
            })
          } catch (error) {
            logBetterAuthError(
              'databaseHooks.user.create.after:failed',
              error,
              {
                userId: user.id,
                email: user.email,
              },
            )
            throw error
          }
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      try {
        const attachedActor = await resolveSessionActorForAuthUser(user)

        return {
          user: {
            ...user,
            name: attachedActor?.name || user.name,
            actorId: attachedActor?.id ?? null,
            actorRole: attachedActor?.role ?? null,
            actorStatus: attachedActor?.status ?? null,
            citizenType: attachedActor?.citizenType ?? null,
          },
          session,
        }
      } catch (error) {
        logBetterAuthError('customSession:failed', error, {
          userId: user.id,
          email: user.email,
        })
        throw error
      }
    }),
  ],
})

export type BetterAuthSession = typeof auth.$Infer.Session
