import type { Context } from 'hono'
import { describe, expect, test, vi } from 'vitest'
import { MediaController } from './MediaController'
import type { StorageMaintenanceService } from '../../application/services/StorageMaintenanceService'
import type { IMediaStorage } from '../../domain/interfaces'
import type { IReferencedMediaRepository } from '../../domain/repositories'
import type { AppVariables } from '../http/types'

const BUCKET =
  'https://ref.supabase.co/storage/v1/object/public/fake-news-media'
const url = (path: string) => `${BUCKET}/${path}`

// Identity-ish storage: maps public URLs back to their in-bucket path and
// records what it was asked to delete.
function makeStorage(): IMediaStorage & { deleted: string[] } {
  const deleted: string[] = []
  return {
    deleted,
    toObjectPaths: (urls: string[]) =>
      urls.map((u) => u.replace(`${BUCKET}/`, '')),
    deleteObjects: vi.fn(async (paths: string[]) => {
      deleted.push(...paths)
    }),
    deleteByPublicUrls: vi.fn().mockResolvedValue(undefined),
    listObjects: vi.fn().mockResolvedValue([]),
  }
}

function fakeContext(actorId: string, body: unknown) {
  const captured: { payload?: unknown } = {}
  const c = {
    get: (key: string) =>
      key === 'actor' ? { actorId, actorRole: 'CITIZEN' } : undefined,
    req: { valid: () => body },
    json: (payload: unknown) => {
      captured.payload = payload
      return payload
    },
  } as unknown as Context<{ Variables: AppVariables }>
  return { c, captured }
}

describe('MediaController.cleanup', () => {
  function make(referencedUrls: string[] = []) {
    const storage = makeStorage()
    const referenced: IReferencedMediaRepository = {
      listReferencedMediaUrls: vi.fn().mockResolvedValue([]),
      filterReferencedUrls: vi.fn(async (urls: string[]) =>
        urls.filter((u) => referencedUrls.includes(u)),
      ),
    }
    const maintenance = {
      sweepOrphans: vi.fn(),
    } as unknown as StorageMaintenanceService
    const controller = new MediaController(storage, referenced, maintenance)
    return { controller, storage }
  }

  test('deletes only the caller-owned single-segment upload', async () => {
    const { controller, storage } = make()
    const { c } = fakeContext('me', {
      urls: [url('uploads/me/a.png')],
    })

    await controller.cleanup(c)

    expect(storage.deleted).toEqual(['uploads/me/a.png'])
  })

  test('rejects another actor prefix, nesting and path traversal (BOLA)', async () => {
    const { controller, storage } = make()
    const { c, captured } = fakeContext('me', {
      urls: [
        url('uploads/victim/a.png'), // not my prefix
        url('uploads/me/sub/a.png'), // nested -> extra segment
        url('uploads/me/../victim/a.png'), // traversal -> contains '/'
      ],
    })

    await controller.cleanup(c)

    expect(storage.deleted).toEqual([])
    expect(captured.payload).toMatchObject({
      data: { requested: 3, deleted: 0 },
    })
  })

  test('refuses to delete an object still referenced by a committed row', async () => {
    const referenced = url('uploads/me/live.png')
    const { controller, storage } = make([referenced])
    const { c, captured } = fakeContext('me', {
      urls: [referenced, url('uploads/me/draft.png')],
    })

    await controller.cleanup(c)

    expect(storage.deleted).toEqual(['uploads/me/draft.png'])
    expect(captured.payload).toMatchObject({
      data: { requested: 2, deleted: 1 },
    })
  })
})

describe('MediaController.sweep', () => {
  function make() {
    const storage = makeStorage()
    const referenced: IReferencedMediaRepository = {
      listReferencedMediaUrls: vi.fn().mockResolvedValue([]),
      filterReferencedUrls: vi.fn().mockResolvedValue([]),
    }
    const sweepOrphans = vi.fn().mockResolvedValue({ orphans: 0, deleted: 0 })
    const maintenance = {
      sweepOrphans,
    } as unknown as StorageMaintenanceService
    const controller = new MediaController(storage, referenced, maintenance)
    return { controller, sweepOrphans }
  }

  test('defaults to a safe dry-run when no flags are given', async () => {
    const { controller, sweepOrphans } = make()
    const { c } = fakeContext('director', {})

    await controller.sweep(c)

    expect(sweepOrphans).toHaveBeenCalledWith({ dryRun: true, force: false })
  })

  test('passes an explicit forced apply through', async () => {
    const { controller, sweepOrphans } = make()
    const { c } = fakeContext('director', { dryRun: false, force: true })

    await controller.sweep(c)

    expect(sweepOrphans).toHaveBeenCalledWith({ dryRun: false, force: true })
  })
})
