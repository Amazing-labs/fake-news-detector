// Adapts the enriched investigation read models into the dossier view props.
// Enum-like fields arrive as plain strings from the API, so they are validated
// against the entity schemas here, at the single API→UI boundary, rather than
// force-cast. Unknown values fall back to a benign default (or null).
import type {
  EvidenceList,
  InvestigationItem,
  InvestigationMediaList,
} from '@entities/investigation/model'
import {
  investigationStatusSchema,
  mediaCategorySchema,
  mediaTypeSchema,
  sourceTypeSchema,
  verdictSchema,
} from '@entities/investigation/schemas'
import type {
  Dossier,
  JournalistProofMedia,
  SourceGroup,
  SourceMedia,
  WatcherEvidenceItem,
} from './types'

const SOURCE_ORIGINS = ['CITIZEN_REPORT', 'DIRECTOR_INITIATED'] as const

const mediaType = mediaTypeSchema.catch('TEXT')
const status = investigationStatusSchema.catch('OPEN')
const verdict = verdictSchema.catch('UNVERIFIABLE')
const nullableVerdict = verdictSchema.nullable().catch(null)
const nullableCategory = mediaCategorySchema.nullable().catch(null)
const nullableSourceType = sourceTypeSchema.nullable().catch(null)

export function toDossier(investigation: InvestigationItem): Dossier {
  return {
    id: investigation.id,
    title: investigation.title ?? 'Dossier sans titre',
    subject: investigation.subject ?? '',
    journalist: investigation.journalistName,
    status: status.parse(investigation.status),
    category: nullableCategory.parse(investigation.mediaCategory),
    verdict: verdict.parse(investigation.draftVerdict),
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
          type: mediaType.parse(item.type),
          url: item.url,
          origin,
          reliability: nullableVerdict.parse(item.reliability),
          category: nullableCategory.parse(item.category),
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
      type: mediaType.parse(item.type),
      origin: 'JOURNALIST_PROOF',
      authoritySource: item.authoritySourceName,
      sourceType: nullableSourceType.parse(item.authoritySourceType),
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
      id: m.id,
      url: m.url,
      type: mediaType.parse(m.type),
      category: nullableCategory.parse(m.category),
      reliability: nullableVerdict.parse(m.reliability),
      justification: m.justification,
    })),
  }))
}
