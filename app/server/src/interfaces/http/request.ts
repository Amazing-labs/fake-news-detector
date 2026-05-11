import type { Context } from 'hono'
import { ValidationError } from '../../shared/errors'
import type { AppVariables } from './types'

export function requiredParam(
  c: Context<{ Variables: AppVariables }>,
  key: string,
): string {
  const value = c.req.param(key)
  if (!value) {
    throw new ValidationError(`Route param ${key} is required`)
  }
  return value
}
