import { type WatcherApplicationStatus } from '../entities/WatcherApplication'
import { WatcherApplication } from '../entities/WatcherApplication'

export interface IWatcherApplicationRepository {
  save(application: WatcherApplication): Promise<void>
  updateWatcherApplicationStatus(
    adminId: string,
    applicationId: string,
    status: WatcherApplicationStatus,
  ): Promise<void>
  findWatcherApplicationById(id: string): Promise<WatcherApplication | null>
  // All applications for an actor (newest first) — the actor's full history.
  findByActorId(actorId: string): Promise<WatcherApplication[]>
  findAll(): Promise<WatcherApplication[]>
}
