import type { SourceType } from '../../../domain/entities/AuthoritySource'
import type { MediaType } from '../../../domain/value-objects'

export interface PublicationAuthoritySourceInput {
  name: string
  type: SourceType
}

export interface SubmitReportInput {
  citizenId: string
  theme: string
  title: string
  content: string
  media?: Array<{ url: string; type: MediaType; order?: number }>
}

export interface SubmitWatcherEvidenceInput {
  citizenId: string
  investigationId: string
  title: string
  content: string
  media: Array<{ url: string; type: MediaType; order?: number }>
}

export interface CreateDirectorInboxSubjectInput {
  theme: string
  description: string
  media?: Array<{ url: string; type: MediaType; order?: number }>
}

export interface PublicationVerifiedLinkInput {
  url: string
  authoritySource?: PublicationAuthoritySourceInput
}

export interface PublicationVerifiedMediaInput {
  url: string
  type: MediaType
  order?: number
  authoritySource?: PublicationAuthoritySourceInput
}

export interface ApproveInvestigationInput {
  verifiedLinks?: PublicationVerifiedLinkInput[]
  verifiedMedia?: PublicationVerifiedMediaInput[]
}
