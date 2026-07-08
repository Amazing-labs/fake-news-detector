import { describe, expect, test, vi } from 'vitest'
import { StorageMaintenanceService } from './StorageMaintenanceService'
import type { IMediaStorage, StorageObject } from '../../domain/interfaces'
import type { IReferencedMediaRepository } from '../../domain/repositories'

const HOUR = 60 * 60 * 1000
const old = () => new Date(Date.now() - 48 * HOUR)
const young = () => new Date(Date.now() - HOUR)

function makeService(
  objects: StorageObject[],
  referencedUrls: string[],
  enabled: boolean,
) {
  const storage: IMediaStorage = {
    listObjects: vi.fn().mockResolvedValue(objects),
    deleteObjects: vi.fn().mockResolvedValue(undefined),
    deleteByPublicUrls: vi.fn().mockResolvedValue(undefined),
    // Identity mapping so referenced URLs compare directly against object paths.
    toObjectPaths: vi.fn((urls: string[]) => urls),
  }
  const referenced: IReferencedMediaRepository = {
    listReferencedMediaUrls: vi.fn().mockResolvedValue(referencedUrls),
    filterReferencedUrls: vi.fn().mockResolvedValue([]),
  }
  const service = new StorageMaintenanceService(storage, referenced, enabled)
  return { service, storage }
}

describe('StorageMaintenanceService.sweepOrphans', () => {
  test('deletes only old, unreferenced objects when enabled', async () => {
    const { service, storage } = makeService(
      [
        { path: 'uploads/a/1', createdAt: old() }, // orphan
        { path: 'uploads/a/2', createdAt: old() }, // referenced -> keep
        { path: 'uploads/a/3', createdAt: young() }, // too young -> keep
      ],
      ['uploads/a/2'],
      true,
    )

    const report = await service.sweepOrphans()

    expect(storage.deleteObjects).toHaveBeenCalledWith(['uploads/a/1'])
    expect(report).toMatchObject({
      listed: 3,
      aged: 2,
      orphans: 1,
      deleted: 1,
      dryRun: false,
      aborted: false,
    })
  })

  test('dry-run computes orphans but deletes nothing', async () => {
    const { service, storage } = makeService(
      [{ path: 'uploads/a/1', createdAt: old() }],
      [],
      false,
    )

    const report = await service.sweepOrphans()

    expect(storage.deleteObjects).not.toHaveBeenCalled()
    expect(report).toMatchObject({ orphans: 1, deleted: 0, dryRun: true })
  })

  test('aborts when it would delete more than the safety cap', async () => {
    const { service, storage } = makeService(
      [
        { path: 'uploads/a/1', createdAt: old() },
        { path: 'uploads/a/2', createdAt: old() },
        { path: 'uploads/a/3', createdAt: old() },
      ],
      [],
      true,
    )

    const report = await service.sweepOrphans()

    expect(storage.deleteObjects).not.toHaveBeenCalled()
    expect(report).toMatchObject({ orphans: 3, deleted: 0, aborted: true })
  })

  test('force bypasses the safety cap and deletes the backlog', async () => {
    const { service, storage } = makeService(
      [
        { path: 'uploads/a/1', createdAt: old() },
        { path: 'uploads/a/2', createdAt: old() },
        { path: 'uploads/a/3', createdAt: old() },
      ],
      [],
      true,
    )

    const report = await service.sweepOrphans({ force: true })

    expect(storage.deleteObjects).toHaveBeenCalledWith([
      'uploads/a/1',
      'uploads/a/2',
      'uploads/a/3',
    ])
    expect(report).toMatchObject({ orphans: 3, deleted: 3, aborted: false })
  })

  test('cap is measured against the aged pool, not the total listed objects', async () => {
    const { service, storage } = makeService(
      [
        { path: 'uploads/a/1', createdAt: old() }, // aged orphan
        { path: 'uploads/a/2', createdAt: young() }, // young -> not eligible
        { path: 'uploads/a/3', createdAt: young() },
        { path: 'uploads/a/4', createdAt: young() },
      ],
      [],
      true,
    )

    const report = await service.sweepOrphans()

    // 1/4 listed = 25% (under cap) but 1/1 aged = 100%: the aged pool must win.
    expect(storage.deleteObjects).not.toHaveBeenCalled()
    expect(report).toMatchObject({
      listed: 4,
      aged: 1,
      orphans: 1,
      deleted: 0,
      aborted: true,
    })
  })
})
