import { apiRequest } from '@shared/api/http'
import type { InvestigationRef } from '@entities/investigation/model'
import type {
  InboxSubjectItem,
  InboxSubjectList,
  InboxSubjectMediaList,
} from './model'

export type InboxSubjectStatus = 'OPEN' | 'IN_PROGRESS' | 'ARCHIVED'

export const inboxSubjectQueryKeys = {
  all: ['inbox-subjects'] as const,
  list: (params?: { status?: InboxSubjectStatus }) =>
    ['inbox-subjects', 'list', params ?? {}] as const,
  detail: (subjectId: string) =>
    ['inbox-subjects', 'detail', subjectId] as const,
  media: (subjectId: string) => ['inbox-subjects', 'media', subjectId] as const,
}

export function getInboxSubject(subjectId: string) {
  return apiRequest<InboxSubjectItem>(`/api/inbox-subjects/${subjectId}`)
}

// Journalist claims an open subject; server returns the opened investigation.
export function pickInboxSubject(subjectId: string) {
  return apiRequest<InvestigationRef>(`/api/inbox-subjects/${subjectId}/pick`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function getInboxSubjectMedia(subjectId: string) {
  return apiRequest<InboxSubjectMediaList>(
    `/api/inbox-subjects/${subjectId}/media`,
  )
}

// Director-only delete; a reason is required only for REPORT subjects (server-enforced).
export function deleteInboxSubject(
  subjectId: string,
  input: { reason?: string } = {},
) {
  return apiRequest<null>(`/api/inbox-subjects/${subjectId}`, {
    method: 'DELETE',
    body: JSON.stringify(input),
  })
}

export function listInboxSubjects(params?: { status?: InboxSubjectStatus }) {
  const search = new URLSearchParams()

  if (params?.status) {
    search.set('status', params.status)
  }

  const query = search.toString()

  return apiRequest<InboxSubjectList>(
    `/api/inbox-subjects${query ? `?${query}` : ''}`,
  )
}
