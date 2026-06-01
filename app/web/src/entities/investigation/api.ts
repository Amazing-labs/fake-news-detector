import { apiRequest } from '../../shared/api/http'
import type { InvestigationList } from './model'

export type InvestigationScope =
  | 'in-progress'
  | 'pending-review'
  | 'published'
  | 'canceled'

export const investigationQueryKeys = {
  all: ['investigations'] as const,
  list: (params?: { scope?: InvestigationScope; journalistId?: string }) =>
    ['investigations', 'list', params ?? {}] as const,
}

export function listInvestigations(params?: {
  scope?: InvestigationScope
  journalistId?: string
}) {
  const search = new URLSearchParams()

  if (params?.scope) {
    search.set('scope', params.scope)
  }

  if (params?.journalistId) {
    search.set('journalistId', params.journalistId)
  }

  const query = search.toString()

  return apiRequest<InvestigationList>(
    `/api/investigations${query ? `?${query}` : ''}`,
  )
}
