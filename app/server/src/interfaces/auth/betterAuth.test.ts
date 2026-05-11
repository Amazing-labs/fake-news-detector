import { describe, expect, test } from 'vitest'
import { canAttachActorToSession } from './betterAuth'

describe('canAttachActorToSession', () => {
  test('allows citizen actor attachment without verified email', () => {
    expect(
      canAttachActorToSession(
        {
          id: 'citizen-1',
          role: 'CITIZEN',
          status: 'ACTIVE',
        },
        false,
      ),
    ).toBe(true)
  })

  test('blocks journalist actor attachment until email ownership is verified', () => {
    expect(
      canAttachActorToSession(
        {
          id: 'journalist-1',
          role: 'JOURNALIST',
          status: 'ACTIVE',
        },
        false,
      ),
    ).toBe(false)
  })

  test('allows elevated actor attachment once email ownership is verified', () => {
    expect(
      canAttachActorToSession(
        {
          id: 'director-1',
          role: 'EDITORIAL_DIRECTOR',
          status: 'ACTIVE',
        },
        true,
      ),
    ).toBe(true)
  })
})
