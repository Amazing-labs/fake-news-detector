// domain/interfaces/NoopMediaStorage.ts

import type { IMediaStorage, StorageObject } from './IMediaStorage'

// Default no-op storage, used when no real adapter is wired (e.g. unit tests),
// mirroring NoopDomainEventPublisher. Deleting nothing is safe: the DB rows are
// still removed; only the underlying bucket objects are left untouched.
export class NoopMediaStorage implements IMediaStorage {
  async deleteByPublicUrls(): Promise<void> {}
  async deleteObjects(): Promise<void> {}
  async listObjects(): Promise<StorageObject[]> {
    return []
  }
  toObjectPaths(publicUrls: string[]): string[] {
    return publicUrls
  }
}
