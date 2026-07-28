import { describe, expect, test, vi } from 'vitest'
import { FactCheckingQueryService } from './FactCheckingQueryService'
import { Investigation } from '../../domain/entities/Investigation'
import { NotFoundError } from '../../shared/errors'
import type { ActorRole } from '../../shared/types'

const JOURNALIST = { actorId: 'j1', actorRole: 'JOURNALIST' as ActorRole }
const DIRECTOR = { actorId: 'd1', actorRole: 'EDITORIAL_DIRECTOR' as ActorRole }
// Watchers carry the CITIZEN role; citizenType is not part of the read context.
const WATCHER = { actorId: 'w1', actorRole: 'CITIZEN' as ActorRole }

// Only the investigation repository takes part in the ownership rule; the other
// collaborators are consulted afterwards to resolve display names.
function buildQueryService(
  investigationRepository: Record<string, unknown>,
  overrides: {
    inboxSubjectRepository?: Record<string, unknown>
    journalistRepository?: Record<string, unknown>
  } = {},
) {
  const inboxSubjectRepository = {
    findByIds: vi.fn(async () => []),
    findById: vi.fn(async () => null),
    ...overrides.inboxSubjectRepository,
  }
  const journalistRepository = {
    findByIds: vi.fn(async () => []),
    findById: vi.fn(async () => null),
    ...overrides.journalistRepository,
  }

  return new FactCheckingQueryService(
    {} as never,
    inboxSubjectRepository as never,
    investigationRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    journalistRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  )
}

const makeInvestigation = (id: string, journalistId: string, status = 'OPEN') =>
  new Investigation(
    id,
    `subject-${id}`,
    journalistId,
    null,
    'UNVERIFIABLE',
    '',
    0,
    status as Investigation['status'],
  )

describe('investigation ownership scoping', () => {
  test('forces a journalist collection read onto their own dossiers, whatever the scope', async () => {
    const findMany = vi.fn(async () => [])
    const service = buildQueryService({ findMany })

    await service.listInvestigationsForReader(JOURNALIST, {
      scope: 'published',
      journalistId: 'someone-else',
    })

    expect(findMany).toHaveBeenCalledWith({
      statuses: ['PUBLISHED'],
      journalistId: 'j1',
    })
  })

  test('returns every status for a journalist when no scope is given', async () => {
    const findMany = vi.fn(async () => [])
    const service = buildQueryService({ findMany })

    await service.listInvestigationsForReader(JOURNALIST)

    expect(findMany).toHaveBeenCalledWith({
      statuses: undefined,
      journalistId: 'j1',
    })
  })

  test('honours the requested journalistId filter for a director', async () => {
    const findMany = vi.fn(async () => [])
    const service = buildQueryService({ findMany })

    await service.listInvestigationsForReader(DIRECTOR, {
      scope: 'pending-review',
      journalistId: 'j2',
    })

    expect(findMany).toHaveBeenCalledWith({
      statuses: ['PENDING_REVIEW'],
      journalistId: 'j2',
    })
  })

  test('lets a journalist read their own dossier in a terminal status', async () => {
    const service = buildQueryService({
      findById: vi.fn(async () => makeInvestigation('i1', 'j1', 'PUBLISHED')),
    })

    const investigation = await service.getInvestigationForReader(
      'i1',
      JOURNALIST,
    )

    expect(investigation.id).toBe('i1')
  })

  test("hides another journalist's dossier behind a not-found", async () => {
    const service = buildQueryService({
      findById: vi.fn(async () => makeInvestigation('i1', 'j2')),
    })

    await expect(
      service.getInvestigationForReader('i1', JOURNALIST),
    ).rejects.toThrow(NotFoundError)
  })

  test('lets a director read any dossier', async () => {
    const service = buildQueryService({
      findById: vi.fn(async () => makeInvestigation('i1', 'j2')),
    })

    const investigation = await service.getInvestigationForReader(
      'i1',
      DIRECTOR,
    )

    expect(investigation.journalistId).toBe('j2')
  })
})

describe('watcher visibility scoping', () => {
  test('limits a watcher to dossiers sent back for revision when no scope is given', async () => {
    const findMany = vi.fn(async () => [])
    const service = buildQueryService({ findMany })

    await service.listInvestigationsForReader(WATCHER)

    expect(findMany).toHaveBeenCalledWith({
      statuses: ['NEEDS_REVISION'],
      journalistId: undefined,
    })
  })

  test('intersects the requested scope with what a watcher may see', async () => {
    const findMany = vi.fn(async () => [])
    const service = buildQueryService({ findMany })

    await service.listInvestigationsForReader(WATCHER, {
      scope: 'contributable',
    })

    expect(findMany).toHaveBeenCalledWith({
      statuses: ['NEEDS_REVISION'],
      journalistId: undefined,
    })
  })

  test('returns nothing rather than something else when a watcher asks for a slice they may not see', async () => {
    const findMany = vi.fn(async () => [])
    const service = buildQueryService({ findMany })

    await service.listInvestigationsForReader(WATCHER, { scope: 'published' })

    expect(findMany).toHaveBeenCalledWith({
      statuses: [],
      journalistId: undefined,
    })
  })

  test('lets a watcher read a dossier sent back for revision', async () => {
    const service = buildQueryService({
      findById: vi.fn(async () =>
        makeInvestigation('i1', 'j1', 'NEEDS_REVISION'),
      ),
    })

    const investigation = await service.getInvestigationForReader('i1', WATCHER)

    expect(investigation.id).toBe('i1')
  })

  test('hides a published dossier from a watcher behind a not-found', async () => {
    const service = buildQueryService({
      findById: vi.fn(async () => makeInvestigation('i1', 'j1', 'PUBLISHED')),
    })

    await expect(
      service.getInvestigationForReader('i1', WATCHER),
    ).rejects.toThrow(NotFoundError)
  })
})
