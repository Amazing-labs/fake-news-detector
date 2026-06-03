import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { customSession } from 'better-auth/plugins'
import { scryptSync, timingSafeEqual } from 'node:crypto'
import { prisma } from '../../infrastructure/config/database'
import {
  provisionCitizenActorForAuthUser,
  resolveSessionActorForAuthUser,
} from './authLinking'

const DEFAULT_SECRET = 'development-better-auth-secret-please-change-me'
const DEFAULT_BASE_URL = 'http://localhost:3000/api/auth'
const DEFAULT_TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
const PBKDF2_PREFIX = 'pbkdf2'
const PBKDF2_DIGEST = 'SHA-256'
const PBKDF2_ITERATIONS = 120_000
const PBKDF2_SALT_BYTES = 16
const PBKDF2_KEY_BYTES = 32
const LEGACY_SCRYPT_PARAMS = {
  N: 16_384,
  r: 16,
  p: 1,
  dkLen: 64,
}

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

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '')
}

function encodeBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Buffer.from(bytes).toString('base64')
}

function decodeBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64'))
}

function readProcessEnv(name: string): string | undefined {
  return typeof process !== 'undefined' ? process.env[name] : undefined
}

function isProduction(): boolean {
  return readProcessEnv('NODE_ENV') === 'production'
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
  try {
    logBetterAuthDebug('hashWorkerPassword:start', {
      passwordLength: password.length,
    })

    const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES))
    const derivedKey = await derivePbkdf2Key(password, salt, PBKDF2_ITERATIONS)
    const hash = [
      PBKDF2_PREFIX,
      PBKDF2_DIGEST.toLowerCase(),
      String(PBKDF2_ITERATIONS),
      encodeBase64(salt),
      encodeBase64(derivedKey),
    ].join('$')

    logBetterAuthDebug('hashWorkerPassword:success', {
      hashPrefix: PBKDF2_PREFIX,
    })

    return hash
  } catch (error) {
    logBetterAuthError('hashWorkerPassword:failed', error)
    throw error
  }
}

function isLegacyScryptHash(hash: string): boolean {
  const [saltHex, keyHex] = hash.split(':')
  return Boolean(
    saltHex &&
    keyHex &&
    saltHex.length === PBKDF2_SALT_BYTES * 2 &&
    keyHex.length === LEGACY_SCRYPT_PARAMS.dkLen * 2,
  )
}

function verifyLegacyScryptPassword({
  hash,
  password,
}: {
  hash: string
  password: string
}): boolean {
  try {
    logBetterAuthDebug('verifyLegacyScryptPassword:start')

    const [saltHex, keyHex] = hash.split(':')

    if (!saltHex || !keyHex) {
      logBetterAuthDebug('verifyLegacyScryptPassword:invalid-format')
      return false
    }

    const targetKey = scryptSync(password.normalize('NFKC'), saltHex, 64, {
      N: LEGACY_SCRYPT_PARAMS.N,
      r: LEGACY_SCRYPT_PARAMS.r,
      p: LEGACY_SCRYPT_PARAMS.p,
      maxmem: 128 * LEGACY_SCRYPT_PARAMS.N * LEGACY_SCRYPT_PARAMS.r * 2,
    })

    const isValid = timingSafeEqual(targetKey, Buffer.from(keyHex, 'hex'))

    logBetterAuthDebug('verifyLegacyScryptPassword:success', {
      isValid,
    })

    return isValid
  } catch (error) {
    logBetterAuthError('verifyLegacyScryptPassword:failed', error)
    throw error
  }
}

async function verifyWorkerPassword({
  hash,
  password,
}: {
  hash: string
  password: string
}): Promise<boolean> {
  try {
    logBetterAuthDebug('verifyWorkerPassword:start', {
      hashFormat: hash.startsWith(`${PBKDF2_PREFIX}$`) ? 'pbkdf2' : 'legacy',
    })

    const [algorithm, digest, iterations, saltBase64, expectedBase64] =
      hash.split('$')

    if (
      algorithm !== PBKDF2_PREFIX ||
      digest !== PBKDF2_DIGEST.toLowerCase() ||
      !iterations ||
      !saltBase64 ||
      !expectedBase64
    ) {
      return isLegacyScryptHash(hash)
        ? verifyLegacyScryptPassword({ hash, password })
        : false
    }

    const numIterations = Number(iterations)

    if (!Number.isInteger(numIterations) || numIterations <= 0) {
      logBetterAuthDebug('verifyWorkerPassword:invalid-iterations', {
        iterations,
      })
      return false
    }

    const salt = decodeBase64(saltBase64)
    const expected = decodeBase64(expectedBase64)
    const derivedKey = await derivePbkdf2Key(password, salt, numIterations)

    if (expected.length !== derivedKey.length) {
      logBetterAuthDebug('verifyWorkerPassword:length-mismatch', {
        expectedLength: expected.length,
        derivedLength: derivedKey.length,
      })
      return false
    }

    const isValid = timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(derivedKey),
    )

    logBetterAuthDebug('verifyWorkerPassword:success', {
      isValid,
      hashFormat: 'pbkdf2',
    })

    return isValid
  } catch (error) {
    logBetterAuthError('verifyWorkerPassword:failed', error)
    throw error
  }
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

function readTrustedOrigins(): string[] {
  const configured = readProcessEnv('BETTER_AUTH_TRUSTED_ORIGINS')
  if (!configured) {
    return [...DEFAULT_TRUSTED_ORIGINS]
  }

  return [
    ...new Set([
      ...DEFAULT_TRUSTED_ORIGINS,
      ...configured.split(',').map(normalizeOrigin).filter(Boolean),
    ]),
  ]
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
