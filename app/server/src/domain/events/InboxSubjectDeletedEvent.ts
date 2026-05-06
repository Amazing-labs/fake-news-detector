import type { InboxSubjectOrigin } from '../entities/InboxSubject'
import type { DomainEvent } from './DomainEvent'

export class InboxSubjectDeletedEvent implements DomainEvent {
  readonly eventName = 'InboxSubjectDeletedEvent'
  readonly occurredAt = new Date()

  constructor(
    public readonly inboxSubjectId: string,
    public readonly actorId: string,
    public readonly origin: InboxSubjectOrigin,
    public readonly reason: string,
    public readonly reportId: string | null,
  ) {}
}
