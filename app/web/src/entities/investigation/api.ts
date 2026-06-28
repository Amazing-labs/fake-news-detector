import { apiRequest } from '@shared/api/http'
import type {
  EvidenceList,
  InvestigationItem,
  InvestigationList,
  InvestigationMediaList,
} from './model'
import type {
  InvestigationDraftInput,
  MediaClassificationInput,
  ProofMediaInput,
} from './schemas'

export type {
  InvestigationDraftInput,
  MediaClassificationInput,
  ProofMediaInput,
} from './schemas'

export type InvestigationScope =
  | 'in-progress'
  | 'pending-review'
  | 'published'
  | 'canceled'
  | 'contributable'

export const investigationQueryKeys = {
  all: ['investigations'] as const,
  list: (params?: { scope?: InvestigationScope; journalistId?: string }) =>
    ['investigations', 'list', params ?? {}] as const,
  detail: (investigationId: string) =>
    ['investigations', 'detail', investigationId] as const,
  sourceMedia: (investigationId: string) =>
    ['investigations', 'source-media', investigationId] as const,
  evidence: (investigationId: string) =>
    ['investigations', 'evidence', investigationId] as const,
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

export function getInvestigation(investigationId: string) {
  return apiRequest<InvestigationItem>(`/api/investigations/${investigationId}`)
}

export function getInvestigationSourceMedia(investigationId: string) {
  return apiRequest<InvestigationMediaList>(
    `/api/investigations/${investigationId}/source-media`,
  )
}

export function getInvestigationEvidence(investigationId: string) {
  return apiRequest<EvidenceList>(
    `/api/investigations/${investigationId}/evidence`,
  )
}

export function saveInvestigationDraft(
  investigationId: string,
  input: InvestigationDraftInput,
) {
  return apiRequest<null>(`/api/investigations/${investigationId}/draft`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function submitInvestigationForReview(investigationId: string) {
  return apiRequest<null>(`/api/investigations/${investigationId}/review`, {
    method: 'POST',
  })
}

export function classifyInvestigationSourceMedia(
  investigationId: string,
  mediaId: number,
  input: MediaClassificationInput,
) {
  return apiRequest<null>(
    `/api/investigations/${investigationId}/source-media/${mediaId}`,
    { method: 'POST', body: JSON.stringify(input) },
  )
}

export function classifyWatcherEvidenceMedia(
  investigationId: string,
  evidenceId: string,
  mediaId: number,
  input: MediaClassificationInput,
) {
  return apiRequest<null>(
    `/api/investigations/${investigationId}/evidence/${evidenceId}/media/${mediaId}`,
    { method: 'POST', body: JSON.stringify(input) },
  )
}

export function addJournalistProofMedia(
  investigationId: string,
  input: ProofMediaInput,
) {
  return apiRequest<null>(
    `/api/investigations/${investigationId}/proof-media`,
    { method: 'POST', body: JSON.stringify(input) },
  )
}
