import type { DomainEvent } from './DomainEvent'

export type InvestigationCancellationReason =
  | 'MANUAL_DIRECTOR_CANCELLATION'
  | 'MAX_REVISION_ATTEMPTS_REACHED'

export class InvestigationCanceledEvent implements DomainEvent {
  readonly eventName = 'InvestigationCanceledEvent'
  readonly occurredAt = new Date()

  constructor(
    public readonly investigationId: string,
    public readonly actorId: string,
    public readonly reasonCode: InvestigationCancellationReason,
    public readonly reasonMessage: string,
  ) {}
}
