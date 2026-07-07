// domain/repositories/IReferencedMediaRepository.ts

// Single source of truth for every storage-bucket URL the domain still points
// to. The storage sweep treats any bucket object NOT in this set as an orphan
// and deletes it.
//
// ⚠️  SAFETY: when you add a new table/column that stores a bucket media `url`,
// you MUST include it in the implementation of this method. Forgetting a table
// makes the sweep delete live files. This is intentionally the one place to
// update.
export interface IReferencedMediaRepository {
  listReferencedMediaUrls(): Promise<string[]>

  // Of the given URLs, returns the subset still referenced by a committed DB
  // row. The immediate-cleanup endpoint uses this to refuse deleting media that
  // is already in use (only abandoned drafts may be removed).
  filterReferencedUrls(urls: string[]): Promise<string[]>
}
