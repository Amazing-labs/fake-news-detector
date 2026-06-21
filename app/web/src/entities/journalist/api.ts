import { apiRequest } from '@shared/api/http'
import type { JournalistList } from './model'

export type CreateJournalistInput = {
  name: string
  email: string
}

export type JournalistStatusInput = {
  reason?: 'SPAM' | 'ABUSE' | 'FRAUD' | 'INACTIVITY' | 'USER_REQUEST' | 'OTHER'
  details?: string
}

export const journalistQueryKeys = {
  all: ['journalists'] as const,
  list: () => ['journalists', 'list'] as const,
}

export function listJournalists() {
  return apiRequest<JournalistList>('/api/journalists')
}

export function createJournalist(input: CreateJournalistInput) {
  return apiRequest<{ id: string }>('/api/journalists', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function banJournalist(
  journalistId: string,
  input: JournalistStatusInput,
) {
  return apiRequest<null>(`/api/journalists/${journalistId}/ban`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function disableJournalist(
  journalistId: string,
  input: JournalistStatusInput,
) {
  return apiRequest<null>(`/api/journalists/${journalistId}/disable`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function activateJournalist(journalistId: string) {
  return apiRequest<null>(`/api/journalists/${journalistId}/activate`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
