import { apiRequest } from '@shared/api/http'
import type { InboxSubjectItem, InboxSubjectList } from './model'

export type InboxSubjectStatus = 'OPEN' | 'IN_PROGRESS' | 'ARCHIVED'

export const inboxSubjectQueryKeys = {
  all: ['inbox-subjects'] as const,
  list: (params?: { status?: InboxSubjectStatus }) =>
    ['inbox-subjects', 'list', params ?? {}] as const,
  detail: (subjectId: string) =>
    ['inbox-subjects', 'detail', subjectId] as const,
}

export function getInboxSubject(subjectId: string) {
  return apiRequest<InboxSubjectItem>(`/api/inbox-subjects/${subjectId}`)
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
