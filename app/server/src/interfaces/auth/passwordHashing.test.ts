import { pbkdf2Sync, scryptSync } from 'node:crypto'
import { describe, expect, test } from 'vitest'
import {
  PBKDF2_ITERATIONS,
  hashWorkerPassword,
  verifyWorkerPassword,
} from './passwordHashing'

// Cloudflare Workers rejects Web Crypto PBKDF2 above 100 000 iterations, so a
// freshly minted hash must never ask for more than the runtime can derive.
const WORKERS_MAX_ITERATIONS = 100_000

function buildLegacyPbkdf2Hash(password: string, iterations: number): string {
  const salt = Buffer.alloc(16, 7)
  const derived = pbkdf2Sync(password, salt, iterations, 32, 'sha256')

  return [
    'pbkdf2',
    'sha-256',
    String(iterations),
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$')
}

function buildLegacyScryptHash(password: string): string {
  const saltHex = 'a'.repeat(32)
  const key = scryptSync(password.normalize('NFKC'), saltHex, 64, {
    N: 16_384,
    r: 16,
    p: 1,
    maxmem: 128 * 16_384 * 16 * 2,
  })

  return `${saltHex}:${key.toString('hex')}`
}

describe('hashWorkerPassword', () => {
  test('stays within the iteration count Cloudflare Workers accepts', () => {
    expect(PBKDF2_ITERATIONS).toBeLessThanOrEqual(WORKERS_MAX_ITERATIONS)
  })

  test('records its parameters in the hash', async () => {
    const hash = await hashWorkerPassword('a-strong-password')
    const [algorithm, digest, iterations] = hash.split('$')

    expect(algorithm).toBe('pbkdf2')
    expect(digest).toBe('sha-256')
    expect(Number(iterations)).toBe(PBKDF2_ITERATIONS)
  })

  test('salts every hash', async () => {
    const first = await hashWorkerPassword('a-strong-password')
    const second = await hashWorkerPassword('a-strong-password')

    expect(first).not.toBe(second)
  })
})

describe('verifyWorkerPassword', () => {
  test('accepts the password it hashed', async () => {
    const hash = await hashWorkerPassword('a-strong-password')

    await expect(
      verifyWorkerPassword({ hash, password: 'a-strong-password' }),
    ).resolves.toBe(true)
  })

  test('rejects a wrong password', async () => {
    const hash = await hashWorkerPassword('a-strong-password')

    await expect(
      verifyWorkerPassword({ hash, password: 'another-password' }),
    ).resolves.toBe(false)
  })

  test('verifies hashes minted above the Workers iteration ceiling', async () => {
    const hash = buildLegacyPbkdf2Hash('a-strong-password', 120_000)

    await expect(
      verifyWorkerPassword({ hash, password: 'a-strong-password' }),
    ).resolves.toBe(true)
    await expect(
      verifyWorkerPassword({ hash, password: 'another-password' }),
    ).resolves.toBe(false)
  })

  test('verifies legacy scrypt hashes', async () => {
    const hash = buildLegacyScryptHash('a-strong-password')

    await expect(
      verifyWorkerPassword({ hash, password: 'a-strong-password' }),
    ).resolves.toBe(true)
    await expect(
      verifyWorkerPassword({ hash, password: 'another-password' }),
    ).resolves.toBe(false)
  })

  test('rejects a hash it cannot parse', async () => {
    await expect(
      verifyWorkerPassword({
        hash: 'not-a-hash',
        password: 'a-strong-password',
      }),
    ).resolves.toBe(false)
  })

  test('rejects a hash carrying a nonsensical iteration count', async () => {
    await expect(
      verifyWorkerPassword({
        hash: 'pbkdf2$sha-256$zero$c2FsdA==$a2V5',
        password: 'a-strong-password',
      }),
    ).resolves.toBe(false)
  })
})
