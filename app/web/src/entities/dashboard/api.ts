import { apiRequest } from '@shared/api/http'
import type { ActorMetrics } from './model'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  metrics: () => ['dashboard', 'metrics'] as const,
}

export function getDashboardMetrics() {
  return apiRequest<ActorMetrics>('/api/dashboard/metrics')
}
