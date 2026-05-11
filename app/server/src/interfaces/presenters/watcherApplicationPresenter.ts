import type { WatcherApplication } from '../../domain/entities/WatcherApplication'

export function presentWatcherApplication(application: WatcherApplication) {
  return {
    id: application.id,
    actorId: application.actorId,
    motivation: application.motivation,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
  }
}

export function presentWatcherApplicationList(
  applications: WatcherApplication[],
) {
  return {
    items: applications.map(presentWatcherApplication),
    total: applications.length,
  }
}
