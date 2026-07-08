/** An object stored in the bucket, as returned by a listing. */
export interface StorageObject {
  /** Bucket-relative path, e.g. `uploads/<actorId>/<uuid>.png`. */
  path: string
  createdAt: Date
}

/** Server-side bucket access (the anon client used by the web app can't delete). */
export interface IMediaStorage {
  /** Best-effort removal by public URL. */
  deleteByPublicUrls(publicUrls: string[]): Promise<void>
  /** Best-effort removal by bucket-relative path. */
  deleteObjects(paths: string[]): Promise<void>
  /** Recursively lists every object under a prefix (used by the sweep). */
  listObjects(prefix: string): Promise<StorageObject[]>
  /** Maps public URLs to bucket-relative paths. */
  toObjectPaths(publicUrls: string[]): string[]
}
