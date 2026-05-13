import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession } from 'better-auth/plugins'
import { timingSafeEqual } from 'node:crypto'
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
const PBKDF2_PREFIX = 'pbkdf2'
const PBKDF2_DIGEST = 'SHA-256'
const PBKDF2_ITERATIONS = 120_000
const PBKDF2_SALT_BYTES = 16
const PBKDF2_KEY_BYTES = 32

function encodeBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Buffer.from(bytes).toString('base64')
}

function decodeBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64'))
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

async function derivePbkdf2Key(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(new TextEncoder().encode(password)),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: PBKDF2_DIGEST,
      salt: toArrayBuffer(salt),
      iterations,
    },
    passwordKey,
    PBKDF2_KEY_BYTES * 8,
  )

  return new Uint8Array(derivedBits)
}

async function hashWorkerPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES))
  const derivedKey = await derivePbkdf2Key(
    password,
    salt,
    PBKDF2_ITERATIONS,
  )

  return [
    PBKDF2_PREFIX,
    PBKDF2_DIGEST.toLowerCase(),
    String(PBKDF2_ITERATIONS),
    encodeBase64(salt),
    encodeBase64(derivedKey),
  ].join('$')
}

async function verifyWorkerPassword({
  hash,
  password,
}: {
  hash: string
  password: string
}): Promise<boolean> {
  const [algorithm, digest, iterations, saltBase64, expectedBase64] =
    hash.split('$')

  if (
    algorithm !== PBKDF2_PREFIX ||
    digest !== PBKDF2_DIGEST.toLowerCase() ||
    !iterations ||
    !saltBase64 ||
    !expectedBase64
  ) {
    return false
  }

  const salt = decodeBase64(saltBase64)
  const expected = decodeBase64(expectedBase64)
  const derivedKey = await derivePbkdf2Key(
    password,
    salt,
    Number(iterations),
  )

  if (expected.length !== derivedKey.length) {
    return false
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(derivedKey))
}

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
    password: {
      hash: hashWorkerPassword,
      verify: verifyWorkerPassword,
    },
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
