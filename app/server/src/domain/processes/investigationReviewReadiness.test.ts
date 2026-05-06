import { describe, expect, test } from 'vitest'
import { Investigation } from '../entities/Investigation'
import { InvestigationMedia } from '../value-objects/Media'
import {
  assertInvestigationReadyForDirectorReview,
  assertWatcherEvidenceMediaCompleteForReview,
} from './investigationReviewReadiness'
import { Evidence } from '../entities/Evidence'
import { EvidenceMedia } from '../value-objects/Media'
import { BusinessRuleError } from '../../shared/errors'

describe('investigationReviewReadiness', () => {
  test('assertInvestigation passes when source media fully classified', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      'j1',
      'FABRICATED',
      'FALSE',
      '',
      0,
      'IN_PROGRESS',
    )
    const m = new InvestigationMedia(
      1,
      'https://x',
      'IMAGE',
      0,
      'CITIZEN_REPORT',
      'i1',
      'c1',
      'MISLEADING',
      'MISLEADING',
      'ok',
    )
    expect(() =>
      assertInvestigationReadyForDirectorReview(inv, [m]),
    ).not.toThrow()
  })

  test('assertInvestigation throws when source media missing justification', () => {
    const inv = new Investigation(
      'i1',
      'is1',
      'j1',
      'FABRICATED',
      'FALSE',
      '',
      0,
      'IN_PROGRESS',
    )
    const m = new InvestigationMedia(
      1,
      'https://x',
      'IMAGE',
      0,
      'DIRECTOR_INITIATED',
      'i1',
      'd1',
      'MISLEADING',
      'TRUE',
      '   ',
    )
    expect(() => assertInvestigationReadyForDirectorReview(inv, [m])).toThrow(
      BusinessRuleError,
    )
  })

  test('assertWatcherEvidence requires journalist-filled media fields', () => {
    const ev = new Evidence('e1', 'c', 't', 'i1', 'w1', [])
    const media = [
      new EvidenceMedia(1, 'u', 'IMAGE', 0, 'e1', 'w1', 'OTHER', 'TRUE', 'ok'),
    ]
    expect(() =>
      assertWatcherEvidenceMediaCompleteForReview([{ evidence: ev, media }]),
    ).not.toThrow()
  })

  test('assertWatcherEvidence throws when evidence has no media', () => {
    const ev = new Evidence('e1', 'c', 't', 'i1', 'w1', [])
    expect(() =>
      assertWatcherEvidenceMediaCompleteForReview([
        { evidence: ev, media: [] },
      ]),
    ).toThrow(BusinessRuleError)
  })
})
