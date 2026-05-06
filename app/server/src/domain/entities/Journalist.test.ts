import { describe, expect, test } from 'vitest'
import { Journalist } from './Journalist'
import { Investigation } from './Investigation'

describe('Journalist onInvestigationFinalized', () => {
  test('decrements activeInvestigationsCount for CANCELED', () => {
    const journalist = new Journalist(
      'j1',
      'Journalist',
      'j@test',
      'JOURNALIST',
      'ACTIVE',
      0,
      new Date(),
      1,
    )
    const investigation = new Investigation(
      'i1',
      's1',
      journalist.id,
      'FABRICATED',
      'TRUE',
      '',
      0,
      'CANCELED',
    )

    journalist.onInvestigationFinalized(investigation)

    expect(journalist.activeInvestigationsCount).toBe(0)
    expect(journalist.engagementScore).toBe(0)
  })

  test('decrements activeInvestigationsCount and awards points for PUBLISHED', () => {
    const journalist = new Journalist(
      'j1',
      'Journalist',
      'j@test',
      'JOURNALIST',
      'ACTIVE',
      0,
      new Date(),
      1,
    )
    const investigation = new Investigation(
      'i1',
      's1',
      journalist.id,
      'FABRICATED',
      'TRUE',
      '',
      0,
      'PUBLISHED',
    )

    journalist.onInvestigationFinalized(investigation)

    expect(journalist.activeInvestigationsCount).toBe(0)
    expect(journalist.engagementScore).toBe(2)
  })

  test('does nothing for another journalist investigation', () => {
    const journalist = new Journalist(
      'j1',
      'Journalist',
      'j@test',
      'JOURNALIST',
      'ACTIVE',
      0,
      new Date(),
      1,
    )
    const investigation = new Investigation(
      'i1',
      's1',
      'j2',
      'FABRICATED',
      'TRUE',
      '',
      0,
      'CANCELED',
    )

    journalist.onInvestigationFinalized(investigation)

    expect(journalist.activeInvestigationsCount).toBe(1)
    expect(journalist.engagementScore).toBe(0)
  })
})
