import type { InboxSubject } from '../../domain/entities/InboxSubject'
import type {
  EnrichedInboxSubject,
  InboxSubjectMediaView,
} from '../../application/services/FactCheckingQueryService'

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

export function presentInboxSubjectMedia(media: InboxSubjectMediaView) {
  return {
    id: media.id,
    url: media.url,
    type: media.type,
    order: media.order,
    origin: media.origin,
    uploadedById: media.uploadedById,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  }
}

export function presentInboxSubjectMediaList(items: InboxSubjectMediaView[]) {
  return {
    items: items.map(presentInboxSubjectMedia),
    total: items.length,
  }
}
