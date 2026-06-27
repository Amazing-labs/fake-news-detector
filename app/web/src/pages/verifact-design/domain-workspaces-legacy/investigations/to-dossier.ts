// Adapts the enriched investigation read models into the dossier view props.
// Enum fields arrive as plain strings from the API but are backend-guaranteed
// Prisma enum values, so they are narrowed to the schema enum types here, at the
// single transformation boundary.
import type {
  EvidenceList,
  InvestigationItem,
  InvestigationMediaList,
} from '@entities/investigation/model'
import type {
  InvestigationStatus,
  MediaCategory,
  MediaType,
  SourceType,
  Verdict,
} from '@entities/investigation/schemas'
import type {
  Dossier,
  JournalistProofMedia,
  SourceGroup,
  SourceMedia,
  WatcherEvidenceItem,
} from './types'

const SOURCE_ORIGINS = ['CITIZEN_REPORT', 'DIRECTOR_INITIATED'] as const

export function toDossier(investigation: InvestigationItem): Dossier {
  return {
    id: investigation.id,
    title: investigation.title ?? 'Dossier sans titre',
    subject: investigation.subject ?? '',
    journalist: investigation.journalistName,
    status: investigation.status as InvestigationStatus,
    category: investigation.mediaCategory as MediaCategory | null,
    verdict: (investigation.draftVerdict ?? 'UNVERIFIABLE') as Verdict,
    attempts: investigation.attemptCount,
    updatedAt: new Date(investigation.updatedAt).toLocaleDateString('fr-FR'),
    notes: investigation.investigationNotes ?? '',
  }
}

export function toSourceGroups(media: InvestigationMediaList): SourceGroup[] {
  return SOURCE_ORIGINS.map((origin) => ({
    origin,
    media: media.items
      .filter((item) => item.origin === origin)
      .map(
        (item): SourceMedia => ({
          id: item.id,
          type: item.type as MediaType,
          url: item.url,
          origin,
          reliability: item.reliability as Verdict | null,
          category: item.category as MediaCategory | null,
          justification: item.justification,
        }),
      ),
  })).filter((group) => group.media.length > 0)
}

export function toJournalistProof(
  media: InvestigationMediaList,
): JournalistProofMedia[] {
  return media.items
    .filter((item) => item.origin === 'JOURNALIST_PROOF')
    .map((item) => ({
      id: item.id,
      type: item.type as MediaType,
      origin: 'JOURNALIST_PROOF',
      authoritySource: item.authoritySourceName,
      sourceType: item.authoritySourceType as SourceType | null,
      url: item.url,
    }))
}

export function toWatcherEvidence(
  evidence: EvidenceList,
): WatcherEvidenceItem[] {
  return evidence.items.map((item) => ({
    id: item.id,
    title: item.title,
    watcher: item.watcherName,
    note: item.content,
    media: item.media.map((m) => ({
      url: m.url,
      type: m.type as MediaType,
      category: m.category as MediaCategory | null,
      reliability: m.reliability as Verdict | null,
      justification: m.justification,
    })),
  }))
}
