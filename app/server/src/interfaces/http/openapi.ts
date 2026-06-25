// interfaces/http/openapi.ts
//
// Shared building blocks for schema-driven routes (@hono/zod-openapi).
// Every route module is an OpenAPIHono sub-app created here so request params
// and bodies are validated at the route layer, before the controller runs.

import { OpenAPIHono } from '@hono/zod-openapi'
import type { Hook } from '@hono/zod-openapi'
import type { AppVariables } from './types'

type AppEnv = { Variables: AppVariables }

// Route-layer validation failures are re-thrown so the central onError handler
// (toErrorResponse) formats them exactly like the previous in-controller checks.
const throwOnValidationError: Hook<unknown, AppEnv, string, unknown> = (
  result,
) => {
  if (!result.success) {
    throw result.error
  }
}

export function createOpenAPIRoutes(): OpenAPIHono<AppEnv> {
  return new OpenAPIHono<AppEnv>({ defaultHook: throwOnValidationError })
}

// Responses are described (not content-typed) on purpose: it keeps the handler
// free to return the shared `ok` / `created` / `noContent` envelopes while still
// declaring the route contract.
export const okResponse = (description = 'OK') => ({
  200: { description },
})
export const createdResponse = (description = 'Created') => ({
  201: { description },
})
export const noContentResponse = (description = 'No Content') => ({
  204: { description },
})
