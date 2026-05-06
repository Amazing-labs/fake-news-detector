// domain/repositories/IInboxSubjectMediaRepository.ts
import type { InboxSubjectMedia } from '../value-objects/Media'
import type { MediaType } from '../value-objects'
import type { InboxSubjectMediaOrigin } from '../value-objects'

export interface InboxSubjectMediaInsert {
  url: string
  type: MediaType
  order: number
  uploadedById: string
  origin: InboxSubjectMediaOrigin
}

export interface IInboxSubjectMediaRepository {
  saveMany(
    inboxSubjectId: string,
    items: InboxSubjectMediaInsert[],
  ): Promise<void>
  findByInboxSubjectId(inboxSubjectId: string): Promise<InboxSubjectMedia[]>
}
