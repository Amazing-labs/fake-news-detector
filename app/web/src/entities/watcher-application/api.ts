import { apiRequest } from '@shared/api/http'
import type {
  WatcherApplicationItem,
  WatcherApplicationList,
} from './model'

export type SubmitWatcherApplicationInput = {
  motivation: string
}

export const watcherApplicationQueryKeys = {
  all: ['watcher-applications'] as const,
  list: () => ['watcher-applications', 'list'] as const,
  detail: (applicationId: string) =>
    ['watcher-applications', 'detail', applicationId] as const,
}

export function listWatcherApplications() {
  return apiRequest<WatcherApplicationList>('/api/watcher-applications')
}

export function getWatcherApplication(applicationId: string) {
  return apiRequest<WatcherApplicationItem>(
    `/api/watcher-applications/${applicationId}`,
  )
}

export function submitWatcherApplication(input: SubmitWatcherApplicationInput) {
  return apiRequest<{ id: string }>('/api/watcher-applications', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function approveWatcherApplication(applicationId: string) {
  return apiRequest<null>(
    `/api/watcher-applications/${applicationId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  )
}

export function rejectWatcherApplication(applicationId: string) {
  return apiRequest<null>(`/api/watcher-applications/${applicationId}/reject`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
