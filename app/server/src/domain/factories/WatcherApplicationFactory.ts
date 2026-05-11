import {
  WatcherApplication,
  type WatcherApplicationStatus,
} from '../entities/WatcherApplication'
import { randomUUID } from 'node:crypto'

type CreateWatcherApplicationParams = {
  actorId: string
  motivation: string
}

export class WatcherApplicationFactory {
  static create(params: CreateWatcherApplicationParams): WatcherApplication {
    return new WatcherApplication(
      randomUUID(),
      params.actorId,
      params.motivation,
      'PENDING' as WatcherApplicationStatus,
    )
  }
}
