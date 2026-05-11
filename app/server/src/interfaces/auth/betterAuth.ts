import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession } from 'better-auth/plugins'
import { prisma } from '../../infrastructure/config/database'

const DEFAULT_SECRET = 'development-better-auth-secret-please-change-me'
const DEFAULT_BASE_URL = 'http://localhost:3000/api/auth'
const DEFAULT_TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
]

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
  secret: process.env.BETTER_AUTH_SECRET ?? DEFAULT_SECRET,
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
          const existingActor = await prisma.actor.findUnique({
            where: { email: user.email },
            select: { id: true },
          })

          if (!existingActor) {
            await prisma.actor.create({
              data: {
                name: user.name,
                email: user.email,
                role: 'CITIZEN',
                status: 'ACTIVE',
              },
            })
          }
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const actor = await prisma.actor.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          role: true,
          status: true,
        },
      })

      return {
        user: {
          ...user,
          actorId: actor?.id ?? null,
          actorRole: actor?.role ?? null,
          actorStatus: actor?.status ?? null,
        },
        session,
      }
    }),
  ],
})

export type BetterAuthSession = typeof auth.$Infer.Session
