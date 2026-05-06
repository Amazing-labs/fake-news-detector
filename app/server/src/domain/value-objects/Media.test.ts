import { describe, expect, test } from 'vitest'
import { InvestigationMedia } from './Media'
import { BusinessRuleError } from '../../shared/errors'

describe('InvestigationMedia', () => {
  test('rejects JOURNALIST_PROOF without authority source', () => {
    expect(
      () =>
        new InvestigationMedia(
          1,
          'https://example.com/file.png',
          'IMAGE',
          1,
          'JOURNALIST_PROOF',
          'investigation-1',
          'actor-1',
        ),
    ).toThrow(BusinessRuleError)
  })

  test('rejects JOURNALIST_PROOF with category/reliability', () => {
    expect(
      () =>
        new InvestigationMedia(
          1,
          'https://example.com/file.png',
          'IMAGE',
          1,
          'JOURNALIST_PROOF',
          'investigation-1',
          'actor-1',
          'MANIPULATED',
          'FALSE',
          undefined,
          'authority-1',
        ),
    ).toThrow(BusinessRuleError)
  })

  test('allows CITIZEN_REPORT with reliability/category updates', () => {
    const media = new InvestigationMedia(
      1,
      'https://example.com/file.png',
      'IMAGE',
      1,
      'CITIZEN_REPORT',
      'investigation-1',
      'actor-1',
    )

    media.submitCategory('MISLEADING')
    media.submitReliabilityVerdict('MISLEADING')
    media.submitJustification('Indice de montage detecte')

    expect(media.category).toBe('MISLEADING')
    expect(media.reliability).toBe('MISLEADING')
    expect(media.justification).toBe('Indice de montage detecte')
  })

  test('allows DIRECTOR_INITIATED with same classification updates as citizen source', () => {
    const media = new InvestigationMedia(
      1,
      'https://example.com/d.png',
      'IMAGE',
      0,
      'DIRECTOR_INITIATED',
      'investigation-1',
      'dir-1',
    )
    media.submitCategory('OTHER')
    media.submitReliabilityVerdict('MISLEADING')
    media.submitJustification('Analyse requise')
    expect(media.requiresJournalistClassification()).toBe(true)
  })

  test('rejects JOURNALIST_PROOF with justification', () => {
    expect(
      () =>
        new InvestigationMedia(
          1,
          'https://example.com/file.png',
          'IMAGE',
          1,
          'JOURNALIST_PROOF',
          'investigation-1',
          'actor-1',
          undefined,
          undefined,
          'should not be set',
          'authority-1',
        ),
    ).toThrow(BusinessRuleError)
  })
})
