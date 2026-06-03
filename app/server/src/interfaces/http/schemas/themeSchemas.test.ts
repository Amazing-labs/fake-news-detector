import { describe, expect, test } from 'vitest'
import { createDirectorInboxSubjectSchema } from './inboxSubjectSchemas'
import { submitReportSchema } from './reportSchemas'

describe('verification theme schemas', () => {
  test('accept known themes for report submission and director subjects', () => {
    expect(
      submitReportSchema.parse({
        theme: 'Santé',
        title: 'Rumeur',
        content: 'Message reçu',
      }).theme,
    ).toBe('Santé')

    expect(
      createDirectorInboxSubjectSchema.parse({
        theme: 'Économie',
        description: 'Sujet ouvert par la rédaction',
      }).theme,
    ).toBe('Économie')
  })

  test('reject unsupported themes for report submission and director subjects', () => {
    expect(() =>
      submitReportSchema.parse({
        theme: 'Rumeur libre',
        title: 'Rumeur',
        content: 'Message reçu',
      }),
    ).toThrow()

    expect(() =>
      createDirectorInboxSubjectSchema.parse({
        theme: 'Rumeur libre',
        description: 'Sujet ouvert par la rédaction',
      }),
    ).toThrow()
  })
})
