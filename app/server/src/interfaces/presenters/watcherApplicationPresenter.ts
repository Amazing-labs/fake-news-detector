import type { WatcherApplication } from '../../domain/entities/WatcherApplication'
import type { EnrichedWatcherApplication } from '../../application/services/FactCheckingQueryService'

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

export function presentEnrichedWatcherApplication({
  application,
  applicantName,
}: EnrichedWatcherApplication) {
  return {
    ...presentWatcherApplication(application),
    applicantName,
  }
}

export function presentEnrichedWatcherApplicationList(
  items: EnrichedWatcherApplication[],
) {
  return {
    items: items.map(presentEnrichedWatcherApplication),
    total: items.length,
  }
}
