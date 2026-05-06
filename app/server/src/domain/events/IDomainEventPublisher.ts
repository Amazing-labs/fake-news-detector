import type { DomainEvent } from './DomainEvent'

export interface IDomainEventPublisher {
  publish(event: DomainEvent): Promise<void>
}

export class NoopDomainEventPublisher implements IDomainEventPublisher {
  async publish(_event: DomainEvent): Promise<void> {
    return
  }
}
