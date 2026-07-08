/** Bucket URLs the domain still references; anything else is a sweep orphan. */
export interface IReferencedMediaRepository {
  listReferencedMediaUrls(): Promise<string[]>
  /** Of the given URLs, the subset still referenced by a committed row. */
  filterReferencedUrls(urls: string[]): Promise<string[]>
}
