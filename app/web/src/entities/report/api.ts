import { apiRequest } from '../../shared/api/http'
import type { ReportList } from './model'

export type MediaInput = {
  url: string
  type: 'AUDIO' | 'LINK' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
  order?: number
}

export type CreateReportInput = {
  theme: string
  title?: string
  content?: string
  media?: MediaInput[]
}

export const reportQueryKeys = {
  all: ['reports'] as const,
  list: (params?: { citizenId?: string }) =>
    ['reports', 'list', params ?? {}] as const,
}

export function listReports(params?: { citizenId?: string }) {
  const search = new URLSearchParams()

  if (params?.citizenId) {
    search.set('citizenId', params.citizenId)
  }

  const query = search.toString()

  return apiRequest<ReportList>(`/api/reports${query ? `?${query}` : ''}`)
}

export function createReport(input: CreateReportInput) {
  return apiRequest<{ id: string }>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
