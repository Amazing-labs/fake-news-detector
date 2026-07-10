import type { Context } from 'hono'
import { describe, expect, test } from 'vitest'
import { toErrorResponse } from './responses'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors'

function capture() {
  const calls: {
    payload: { success: boolean; error: string }
    status: number
  }[] = []
  const c = {
    json: (payload: { success: boolean; error: string }, status: number) => {
      calls.push({ payload, status })
      return { payload, status }
    },
  } as unknown as Context
  return { c, calls }
}

describe('toErrorResponse — French messages', () => {
  test('maps a known BusinessRuleError message to French (409)', () => {
    const { c, calls } = capture()
    toErrorResponse(c, new BusinessRuleError('Inbox subject is archived'))
    expect(calls[0]).toEqual({
      payload: { success: false, error: 'Le sujet est archivé.' },
      status: 409,
    })
  })

  test('NotFoundError returns a generic French message (404)', () => {
    const { c, calls } = capture()
    toErrorResponse(c, new NotFoundError('Report', 'r1'))
    expect(calls[0].status).toBe(404)
    expect(calls[0].payload.error).toBe(
      'La ressource demandée est introuvable.',
    )
  })

  test('an unmapped domain message passes through unchanged', () => {
    const { c, calls } = capture()
    toErrorResponse(
      c,
      new ValidationError('internal invariant, not user-facing'),
    )
    expect(calls[0].payload.error).toBe('internal invariant, not user-facing')
    expect(calls[0].status).toBe(400)
  })
})
