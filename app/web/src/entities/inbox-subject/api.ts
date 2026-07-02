import { apiRequest } from '@shared/api/http'
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

// A journalist claims an open subject; the server opens the investigation and
// returns it, so the caller can navigate straight to the new dossier.
export function pickInboxSubject(subjectId: string) {
  return apiRequest<{ id: string }>(`/api/inbox-subjects/${subjectId}/pick`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function getInboxSubjectMedia(subjectId: string) {
  return apiRequest<InboxSubjectMediaList>(
    `/api/inbox-subjects/${subjectId}/media`,
  )
}

// Director-only: deletes a subject. The server requires a non-empty reason
// (deleteInboxSubjectSchema) for the editorial audit trail.
export function deleteInboxSubject(
  subjectId: string,
  input: { reason: string },
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
