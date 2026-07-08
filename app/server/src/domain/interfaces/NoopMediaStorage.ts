import type { IMediaStorage, StorageObject } from './IMediaStorage'

/** No-op storage used when no adapter is wired (e.g. unit tests). */
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
