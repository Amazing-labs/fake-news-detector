// domain/interfaces/IMediaStorage.ts

// Port for deleting media objects from the storage bucket. Only the server may
// delete storage objects (the public client key is RLS-restricted from
// deleting), so this port is driven by the server with a privileged credential.
export interface IMediaStorage {
  // Best-effort removal of the given public URLs from the bucket. Implementations
  // resolve even when some objects are missing; a storage failure must not roll
  // back the surrounding domain operation.
  deleteByPublicUrls(publicUrls: string[]): Promise<void>
}
