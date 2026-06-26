import type { InboxSubject } from '../../domain/entities/InboxSubject'
import type { EnrichedInboxSubject } from '../../application/services/FactCheckingQueryService'

export function presentInboxSubject(subject: InboxSubject) {
  return {
    id: subject.id,
    theme: subject.theme,
    description: subject.description,
    createdById: subject.createdById,
    reportId: subject.reportId,
    status: subject.status,
    origin: subject.origin,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  }
}

export function presentInboxSubjectList(subjects: InboxSubject[]) {
  return {
    items: subjects.map(presentInboxSubject),
    total: subjects.length,
  }
}

export function presentEnrichedInboxSubject({
  subject,
  ownerName,
}: EnrichedInboxSubject) {
  return {
    ...presentInboxSubject(subject),
    ownerName,
  }
}

export function presentEnrichedInboxSubjectList(items: EnrichedInboxSubject[]) {
  return {
    items: items.map(presentEnrichedInboxSubject),
    total: items.length,
  }
}
