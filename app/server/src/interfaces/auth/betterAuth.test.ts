import { describe, expect, test } from 'vitest'
import {
  canAttachActorToSession,
  canAttachLinkedActorToSession,
  canClaimPreprovisionedActorWithoutVerification,
} from './authLinking'

describe('canAttachActorToSession', () => {
  test('allows citizen actor attachment without verified email', () => {
    expect(
      canAttachActorToSession(
        {
          id: 'citizen-1',
          name: 'Citizen',
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
          name: 'Journalist',
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
          name: 'Director',
          role: 'EDITORIAL_DIRECTOR',
          status: 'ACTIVE',
        },
        true,
      ),
    ).toBe(true)
  })

  test('allows explicitly linked elevated actor attachment without verified email', () => {
    expect(
      canAttachLinkedActorToSession({
        id: 'director-1',
        name: 'Director',
        role: 'EDITORIAL_DIRECTOR',
        status: 'ACTIVE',
      }),
    ).toBe(true)
  })

  test('allows preprovisioned director claim without verified email', () => {
    expect(
      canClaimPreprovisionedActorWithoutVerification({
        id: 'director-1',
        name: 'Director',
        role: 'EDITORIAL_DIRECTOR',
        status: 'ACTIVE',
      }),
    ).toBe(true)
  })

  test('allows preprovisioned journalist claim without verified email', () => {
    expect(
      canClaimPreprovisionedActorWithoutVerification({
        id: 'journalist-1',
        name: 'Journalist',
        role: 'JOURNALIST',
        status: 'ACTIVE',
      }),
    ).toBe(true)
  })
})
