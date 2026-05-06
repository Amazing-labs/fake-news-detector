import { describe, expect, test } from 'vitest'
import { copySourceMediaToInvestigationMedia } from './investigationMediaCopy'
import { InboxSubjectMedia, ReportMedia } from '../value-objects/Media'

describe('copySourceMediaToInvestigationMedia', () => {
  test('copies report media as CITIZEN_REPORT ordered', () => {
    const rows = [
      new ReportMedia(2, 'b', 'LINK', 1, 'rep', 'c1'),
      new ReportMedia(1, 'a', 'IMAGE', 0, 'rep', 'c1'),
    ]
    const out = copySourceMediaToInvestigationMedia('inv1', {
      type: 'REPORT',
      rows,
    })
    expect(out).toHaveLength(2)
    expect(out[0].url).toBe('a')
    expect(out[0].origin).toBe('CITIZEN_REPORT')
    expect(out[1].url).toBe('b')
  })

  test('copies director inbox media as DIRECTOR_INITIATED', () => {
    const rows = [
      new InboxSubjectMedia(
        1,
        'x',
        'TEXT',
        0,
        'sub',
        'd1',
        'DIRECTOR_INITIATED',
      ),
    ]
    const out = copySourceMediaToInvestigationMedia('inv1', {
      type: 'INBOX_DIRECTOR',
      rows,
    })
    expect(out).toHaveLength(1)
    expect(out[0].origin).toBe('DIRECTOR_INITIATED')
    expect(out[0].uploadedById).toBe('d1')
  })
})
