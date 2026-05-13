import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession } from 'better-auth/plugins'
import { prisma } from '../../infrastructure/config/database'
import {
  provisionCitizenActorForAuthUser,
  resolveSessionActorForAuthUser,
} from './authLinking'

const DEFAULT_SECRET = 'development-better-auth-secret-please-change-me'
const DEFAULT_BASE_URL = 'http://localhost:3000/api/auth'
const DEFAULT_TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
]

function resolveBetterAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? DEFAULT_SECRET

  if (process.env.NODE_ENV === 'production' && secret === DEFAULT_SECRET) {
    throw new Error(
      'BETTER_AUTH_SECRET must be set in production. Refusing to use the default development secret.',
    )
  }

  return secret
}

function readTrustedOrigins(): string[] {
  const configured = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  if (!configured) {
    return DEFAULT_TRUSTED_ORIGINS
  }

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const auth = betterAuth({
  secret: resolveBetterAuthSecret(),
  baseURL: process.env.BETTER_AUTH_URL ?? DEFAULT_BASE_URL,
  trustedOrigins: readTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  advanced: {
    cookiePrefix: 'fake-news-detector',
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await provisionCitizenActorForAuthUser(user)
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
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
    }),
  ],
})

export type BetterAuthSession = typeof auth.$Infer.Session
