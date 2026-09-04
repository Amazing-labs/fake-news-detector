import { pbkdf2Sync, scryptSync, timingSafeEqual } from 'node:crypto'

const PBKDF2_PREFIX = 'pbkdf2'
const PBKDF2_DIGEST = 'SHA-256'
const PBKDF2_NODE_DIGEST = 'sha256'
// Cloudflare Workers refuses any Web Crypto PBKDF2 derivation above this count
// ("Pbkdf2 failed: iteration counts above 100000 are not supported"). It is the
// ceiling for new hashes, and the boundary that tells a hash this runtime can
// derive apart from a legacy one minted before the ceiling was known.
const PBKDF2_MAX_WEB_CRYPTO_ITERATIONS = 100_000
export const PBKDF2_ITERATIONS = PBKDF2_MAX_WEB_CRYPTO_ITERATIONS
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

async function deriveWithWebCrypto(
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

async function derivePbkdf2Key(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  if (iterations > PBKDF2_MAX_WEB_CRYPTO_ITERATIONS) {
    // Web Crypto rejects these outright on Workers, so node:crypto is the only
    // derivation left to try for hashes stored above the ceiling.
    return new Uint8Array(
      pbkdf2Sync(
        password,
        Buffer.from(salt),
        iterations,
        PBKDF2_KEY_BYTES,
        PBKDF2_NODE_DIGEST,
      ),
    )
  }

  return deriveWithWebCrypto(password, salt, iterations)
}

export async function hashWorkerPassword(password: string): Promise<string> {
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

export async function verifyWorkerPassword({
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
    let derivedKey: Uint8Array

    try {
      derivedKey = await derivePbkdf2Key(password, salt, numIterations)
    } catch (error) {
      if (numIterations > PBKDF2_MAX_WEB_CRYPTO_ITERATIONS) {
        // The stored hash is beyond what this runtime can derive at all. Fail
        // the sign-in instead of a 500: the account needs `reset:password`.
        logBetterAuthError(
          'verifyWorkerPassword:iterations-unsupported',
          error,
          {
            iterations: numIterations,
            maxSupportedIterations: PBKDF2_MAX_WEB_CRYPTO_ITERATIONS,
          },
        )
        return false
      }

      throw error
    }

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
