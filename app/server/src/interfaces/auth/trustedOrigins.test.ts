import { afterEach, describe, expect, test } from 'vitest'
import { isTrustedOrigin, readTrustedOrigins } from './trustedOrigins'

const ORIGINAL = process.env.BETTER_AUTH_TRUSTED_ORIGINS

function configure(value: string | undefined): void {
  if (value === undefined) {
    delete process.env.BETTER_AUTH_TRUSTED_ORIGINS
    return
  }
  process.env.BETTER_AUTH_TRUSTED_ORIGINS = value
}

afterEach(() => configure(ORIGINAL))

describe('trusted origins', () => {
  test('always keeps the local development origins', () => {
    configure(undefined)
    expect(readTrustedOrigins()).toContain('http://localhost:5173')
  })

  test('merges configured origins and tolerates spacing and trailing slashes', () => {
    configure(' https://app.example.com/ , https://admin.example.com ')

    const origins = readTrustedOrigins()

    expect(origins).toContain('https://app.example.com')
    expect(origins).toContain('https://admin.example.com')
    expect(isTrustedOrigin('https://app.example.com')).toBe(true)
  })

  test('rejects an origin that is not configured', () => {
    configure('https://app.example.com')

    expect(isTrustedOrigin('https://evil.example.com')).toBe(false)
    expect(isTrustedOrigin(undefined)).toBe(false)
  })

  // Better Auth would honour a glob pattern that this exact-match check cannot,
  // which is how the CSRF allowlist and the CORS allowlist would drift apart —
  // and a shared-suffix wildcard trusts every site anyone can deploy there.
  test('refuses wildcard entries instead of silently ignoring them', () => {
    configure('https://*.vercel.app')

    expect(() => readTrustedOrigins()).toThrow(/[Ww]ildcard/)
  })

  test('refuses a wildcard even when exact origins are also listed', () => {
    configure('https://app.example.com,https://*.vercel.app')

    expect(() => readTrustedOrigins()).toThrow(/https:\/\/\*\.vercel\.app/)
  })
})
