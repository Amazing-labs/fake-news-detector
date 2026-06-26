import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import {
  BusinessRuleError,
  DomainError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors'

export function ok<T>(c: Context, data: T, message?: string) {
  return c.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    200,
  )
}

export function created<T>(c: Context, data: T, message?: string) {
  return c.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    201,
  )
}

export function noContent(c: Context) {
  return c.body(null, 204)
}

export function toErrorResponse(c: Context, error: unknown) {
  if (error instanceof NotFoundError) {
    return c.json({ success: false, error: error.message }, 404)
  }

  // Route-layer (@hono/zod-openapi) failures such as malformed JSON surface as
  // HTTPException; honor their status instead of masking them as 500.
  if (error instanceof HTTPException) {
    return c.json({ success: false, error: error.message }, error.status)
  }

  if (error instanceof ValidationError) {
    return c.json({ success: false, error: error.message }, 400)
  }

  if (error instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'Invalid request payload',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      400,
    )
  }

  if (error instanceof SyntaxError) {
    return c.json({ success: false, error: 'Invalid JSON payload' }, 400)
  }

  if (error instanceof BusinessRuleError) {
    return c.json({ success: false, error: error.message }, 409)
  }

  if (error instanceof DomainError) {
    return c.json({ success: false, error: error.message }, 422)
  }

  const message =
    error instanceof Error ? error.message : 'Internal server error'
  console.error(message)
  return c.json({ success: false, error: 'Internal server error' }, 500)
}
