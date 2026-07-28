/**
 * @module
 * The single origin allowlist, shared by Better Auth's CSRF check and the CORS
 * layer so the two can never disagree about who is trusted. Kept free of the
 * auth module's side effects (Prisma adapter, module-level `betterAuth()`) so
 * it stays importable and testable on its own.
 */

import { readProcessEnv } from '../../shared'

const DEFAULT_TRUSTED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const WILDCARD = /[*?]/

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '')
}

/**
 * Exact origins only. Better Auth itself accepts glob patterns, but they are
 * refused here for two independent reasons:
 *
 *  - a shared-suffix wildcard such as `https://*.vercel.app` trusts every site
 *    any Vercel user can deploy, which is a CSRF vector, not a convenience;
 *  - the production `/api` rewrite sends every deployment to the same worker,
 *    so trusting preview origins would let a preview of any branch authenticate
 *    against production data.
 *
 * Refusing loudly also keeps this allowlist and Better Auth's own in agreement:
 * a pattern Better Auth would honour but this exact-match check cannot is
 * precisely how the two would drift apart.
 */
export function readTrustedOrigins(): string[] {
  const configured = readProcessEnv('BETTER_AUTH_TRUSTED_ORIGINS')
  if (!configured) {
    return [...DEFAULT_TRUSTED_ORIGINS]
  }

  const entries = configured.split(',').map(normalizeOrigin).filter(Boolean)
  const wildcards = entries.filter((entry) => WILDCARD.test(entry))
  if (wildcards.length > 0) {
    throw new Error(
      `BETTER_AUTH_TRUSTED_ORIGINS must list exact origins. Wildcard entries are refused: ${wildcards.join(', ')}. ` +
        'A shared-suffix pattern trusts every site anyone can deploy on that domain, and lets preview ' +
        'deployments authenticate against production data through the /api rewrite. ' +
        'Use a dedicated preview backend with its own database instead.',
    )
  }

  return [...new Set([...DEFAULT_TRUSTED_ORIGINS, ...entries])]
}

/** Whether a browser Origin may be echoed back on a credentialed response. */
export function isTrustedOrigin(origin: string | undefined): boolean {
  if (!origin) return false
  return readTrustedOrigins().includes(normalizeOrigin(origin))
}
