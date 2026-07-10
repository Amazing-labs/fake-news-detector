import type { Context } from 'hono'
import { ValidationError } from '../../shared/errors'
import type { AppVariables } from './types'

export function requiredParam(
  c: Context<{ Variables: AppVariables }>,
  key: string,
): string {
  const value = c.req.param(key)
  if (!value) {
    throw new ValidationError(`Le paramètre « ${key} » est obligatoire.`)
  }
  return value
}

export function requiredNumericParam(
  c: Context<{ Variables: AppVariables }>,
  key: string,
): number {
  const value = Number(requiredParam(c, key))
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError(
      `Le paramètre « ${key} » doit être un nombre valide.`,
    )
  }
  return value
}

// Reads the JSON body already validated at the route layer (@hono/zod-openapi).
// Controllers stay transport-only and never re-parse the request.
export function validatedJson<T>(c: Context<{ Variables: AppVariables }>): T {
  return c.req.valid('json' as never) as T
}

// Reads the query already validated at the route layer (@hono/zod-openapi).
export function validatedQuery<T>(c: Context<{ Variables: AppVariables }>): T {
  return c.req.valid('query' as never) as T
}
