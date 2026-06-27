import { apiRequest } from '@shared/api/http'
import { actorMetricsSchema } from './schemas'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  metrics: () => ['dashboard', 'metrics'] as const,
}

export async function getDashboardMetrics() {
  const data = await apiRequest<unknown>('/api/dashboard/metrics')
  return actorMetricsSchema.parse(data)
}
