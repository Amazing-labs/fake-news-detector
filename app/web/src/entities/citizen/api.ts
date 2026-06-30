import { apiRequest } from '@shared/api/http'
import type { CitizenList } from './model'
import type { CitizenStatusInput } from './schemas'

export type { CitizenListItem, CitizenList } from './model'
export type { CitizenStatusInput, CitizenStatusReason } from './schemas'

export const citizenQueryKeys = {
  all: ['citizens'] as const,
  list: () => ['citizens', 'list'] as const,
}

export function listCitizens() {
  return apiRequest<CitizenList>('/api/director/citizens')
}

export function banCitizen(citizenId: string, input: CitizenStatusInput) {
  return apiRequest<null>(`/api/director/citizens/${citizenId}/ban`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function disableCitizen(citizenId: string, input: CitizenStatusInput) {
  return apiRequest<null>(`/api/director/citizens/${citizenId}/disable`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function activateCitizen(citizenId: string) {
  return apiRequest<null>(`/api/director/citizens/${citizenId}/activate`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
