import { describe, expect, test } from 'vitest'
import { NotificationFactory } from './NotificationFactory'
import { DomainError } from '../../shared/errors'

describe('NotificationFactory', () => {
  test('createBatch creates one PUBLICATION notification per citizen', () => {
    const notifications = NotificationFactory.createBatch(
      ['actor-1', 'actor-2'],
      'Nouveau verdict publie',
      'publication-1',
    )

    expect(notifications).toHaveLength(2)
    expect(notifications[0].type).toBe('PUBLICATION')
    expect(notifications[0].actorId).toBe('actor-1')
    expect(notifications[0].publicationId).toBe('publication-1')
    expect(notifications[1].type).toBe('PUBLICATION')
    expect(notifications[1].actorId).toBe('actor-2')
    expect(notifications[1].publicationId).toBe('publication-1')
  })

  test('createBatch throws DomainError when publicationId is blank', () => {
    expect(() =>
      NotificationFactory.createBatch(
        ['actor-1'],
        'Nouveau verdict publie',
        '   ',
      ),
    ).toThrow(DomainError)
  })

  test('createArchivedPublicationNotification attaches investigationId', () => {
    const n = NotificationFactory.createArchivedPublicationNotification(
      'a1',
      'Enquête archivée',
      'Message',
      'inv-7',
    )
    expect(n.investigationId).toBe('inv-7')
    expect(n.type).toBe('ARCHIVED_PUBLICATION')
    expect(n.actorId).toBe('a1')
  })
})
