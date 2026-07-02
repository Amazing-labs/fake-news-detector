import { apiRequest } from '@shared/api/http'
import type { CorrectionList, PublicationItem, PublicationList } from './model'
import type { CreateCorrectionInput, PublicationScope } from './schemas'

export type { CreateCorrectionInput, PublicationScope }

export const publicationQueryKeys = {
  all: ['publications'] as const,
  list: (params?: { scope?: PublicationScope }) =>
    ['publications', 'list', params ?? {}] as const,
  detail: (publicationId: string) =>
    ['publications', 'detail', publicationId] as const,
  corrections: (publicationId: string) =>
    ['publications', 'corrections', publicationId] as const,
}

export function listPublications(params?: { scope?: PublicationScope }) {
  const search = new URLSearchParams()

  if (params?.scope) {
    search.set('scope', params.scope)
  }

  const query = search.toString()

  return apiRequest<PublicationList>(
    `/api/publications${query ? `?${query}` : ''}`,
  )
}

export function getPublication(publicationId: string) {
  return apiRequest<PublicationItem>(`/api/publications/${publicationId}`)
}

export function getPublicationCorrections(publicationId: string) {
  return apiRequest<CorrectionList>(
    `/api/publications/${publicationId}/corrections`,
  )
}

export function createPublicationCorrection(
  publicationId: string,
  input: CreateCorrectionInput,
) {
  return apiRequest<{ correctionId: string }>(
    `/api/publications/${publicationId}/corrections`,
    { method: 'POST', body: JSON.stringify(input) },
  )
}
