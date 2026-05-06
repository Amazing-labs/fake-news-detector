import { describe, expect, test } from 'vitest'
import { Investigation } from './Investigation'
import { BusinessRuleError } from '../../shared/errors'

describe('Investigation director review invariants', () => {
  test('approve rejects UNVERIFIABLE verdict', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      'j1',
      'MISLEADING',
      'UNVERIFIABLE',
      '',
      0,
      'PENDING_REVIEW',
    )
    expect(() => inv.approve()).toThrow(BusinessRuleError)
  })

  test('approve allows TRUE from PENDING_REVIEW', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      'j1',
      'MISLEADING',
      'TRUE',
      '',
      0,
      'PENDING_REVIEW',
    )
    inv.approve()
    expect(inv.status).toBe('PUBLISHED')
  })

  test('markAsArchived allows UNVERIFIABLE in PENDING_REVIEW', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      'j1',
      'MISLEADING',
      'UNVERIFIABLE',
      '',
      0,
      'PENDING_REVIEW',
    )
    inv.markAsArchived()
    expect(inv.status).toBe('ARCHIVED')
  })

  test('requestRevision requires PENDING_REVIEW', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      'j1',
      'MISLEADING',
      'TRUE',
      '',
      0,
      'IN_PROGRESS',
    )
    expect(() => inv.requestRevision('NEEDS_REVISION')).toThrow(
      BusinessRuleError,
    )
  })
})
