import { describe, expect, test } from 'vitest'
import { Director } from '../entities/Director'
import { Journalist } from '../entities/Journalist'
import { Investigation } from '../entities/Investigation'
import {
  directorAcceptUnverifiableArchiveWithAudit,
  directorApproveInvestigationWithAudit,
  directorRejectInvestigationWithAudit,
  submitInvestigationForReviewWithAudit,
} from './investigationStatusWorkflow'

describe('investigationStatusWorkflow', () => {
  const director = new Director('d1', 'Dir', 'd@test', 'ACTIVE')
  const journalist = new Journalist(
    'j1',
    'Jour',
    'j@test',
    'JOURNALIST',
    'ACTIVE',
  )

  test('submitInvestigationForReviewWithAudit records transition to PENDING_REVIEW', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      journalist.id,
      'FABRICATED',
      'FALSE',
      'n',
      0,
      'IN_PROGRESS',
    )
    const audit = submitInvestigationForReviewWithAudit(journalist, inv, [], [])
    expect(inv.status).toBe('PENDING_REVIEW')
    expect(audit.newStatus).toBe('PENDING_REVIEW')
    expect(audit.previousStatus).toBe('IN_PROGRESS')
    expect(audit.actorId).toBe(journalist.id)
  })

  test('directorApproveInvestigationWithAudit records PUBLISHED', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      journalist.id,
      'FABRICATED',
      'TRUE',
      'n',
      0,
      'PENDING_REVIEW',
    )
    const audit = directorApproveInvestigationWithAudit(director, inv)
    expect(inv.status).toBe('PUBLISHED')
    expect(audit.isApproval()).toBe(true)
    expect(audit.actorId).toBe(director.id)
  })

  test('directorRejectInvestigationWithAudit records NEEDS_REVISION with comment', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      journalist.id,
      'FABRICATED',
      'TRUE',
      'n',
      0,
      'PENDING_REVIEW',
    )
    const audit = directorRejectInvestigationWithAudit(
      director,
      inv,
      'Sources insuffisantes',
    )
    expect(inv.status).toBe('NEEDS_REVISION')
    expect(audit.isRejection()).toBe(true)
    expect(audit.comment).toBe('Sources insuffisantes')
    expect(inv.attemptCount).toBe(1)
  })

  test('directorAcceptUnverifiableArchiveWithAudit records ARCHIVED', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      journalist.id,
      'FABRICATED',
      'UNVERIFIABLE',
      'n',
      0,
      'PENDING_REVIEW',
    )
    const audit = directorAcceptUnverifiableArchiveWithAudit(
      director,
      inv,
      null,
    )
    expect(inv.status).toBe('ARCHIVED')
    expect(audit.isArchived()).toBe(true)
  })
})
