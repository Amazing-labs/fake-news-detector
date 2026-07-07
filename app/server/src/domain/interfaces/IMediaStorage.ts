// domain/interfaces/IMediaStorage.ts

// An object stored in the bucket, as returned by a listing.
export interface StorageObject {
  // Path relative to the bucket root, e.g. `uploads/<actorId>/<uuid>.png`.
  path: string
  createdAt: Date
}

// Port for managing media objects in the storage bucket. Only the server may
// delete storage objects (the public client key is RLS-restricted from
// deleting), so this port is driven by the server with a privileged credential.
export interface IMediaStorage {
  // Best-effort removal of the given public URLs from the bucket. Implementations
  // resolve even when some objects are missing; a storage failure must not roll
  // back the surrounding domain operation.
  deleteByPublicUrls(publicUrls: string[]): Promise<void>

  // Best-effort removal of objects by their bucket-relative path.
  deleteObjects(paths: string[]): Promise<void>

  // Recursively lists every object under a prefix (e.g. `uploads`), used by the
  // reconciliation sweep to find orphans.
  listObjects(prefix: string): Promise<StorageObject[]>

  // Maps public URLs to their bucket-relative object paths, so callers can
  // compare a set of referenced URLs against listed objects without knowing the
  // bucket layout.
  toObjectPaths(publicUrls: string[]): string[]
}
