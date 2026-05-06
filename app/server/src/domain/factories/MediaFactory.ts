import {
  InvestigationMedia,
  VerifiedLink,
  InboxSubjectMedia,
  EvidenceMedia,
  VerifiedMedia,
} from '../value-objects/Media'

import type {
  MediaType,
  MediaOrigin,
  Verdict,
  MediaCategory,
  InboxSubjectMediaOrigin,
} from '../value-objects'

export interface CreateInvestigationMediaParams {
  id: number
  order: number
  investigationId: string
  url: string
  type: MediaType
  origin: MediaOrigin
  category?: MediaCategory
  reliability?: Verdict
  justification?: string
  authoritySourceId?: string
  uploadedById: string
}

export class InvestigationMediaFactory {
  static create(params: CreateInvestigationMediaParams): InvestigationMedia {
    return new InvestigationMedia(
      params.id,
      params.url,
      params.type,
      params.order,
      params.origin,
      params.investigationId,
      params.uploadedById,
      params.category || undefined,
      params.reliability || undefined,
      params.justification || undefined,
      params.authoritySourceId,
    )
  }

  static createFromCitizenReport(
    id: number,
    order: number,
    url: string,
    type: MediaType,
    investigationId: string,
    uploadedById: string,
    category?: MediaCategory,
    reliability?: Verdict,
    justification?: string,
  ): InvestigationMedia {
    return this.create({
      id,
      order,
      url,
      type,
      origin: 'CITIZEN_REPORT',
      investigationId,
      uploadedById,
      category,
      reliability,
      justification,
    })
  }

  static createFromDirectorInboxSource(
    id: number,
    order: number,
    url: string,
    type: MediaType,
    investigationId: string,
    uploadedById: string,
    category?: MediaCategory,
    reliability?: Verdict,
    justification?: string,
  ): InvestigationMedia {
    return this.create({
      id,
      order,
      url,
      type,
      origin: 'DIRECTOR_INITIATED',
      investigationId,
      uploadedById,
      category,
      reliability,
      justification,
    })
  }

  static createFromJournalistProof(
    id: number,
    order: number,
    url: string,
    type: MediaType,
    investigationId: string,
    uploadedById: string,
    authoritySourceId: string,
  ): InvestigationMedia {
    return this.create({
      id,
      order,
      url,
      type,
      origin: 'JOURNALIST_PROOF',
      investigationId,
      uploadedById,
      authoritySourceId,
    })
  }

  static updateCitizenReportInInvestigationMedia(
    investigationMedia: InvestigationMedia,
    url: string,
    type: MediaType,
    order: number,
    investigationId: string,
    uploadedById: string,
    category?: MediaCategory,
    reliability?: Verdict,
    justification?: string,
    authoritySourceId?: string,
  ): InvestigationMedia {
    return investigationMedia.updateInvestigationMedia(
      investigationMedia.id,
      url,
      type,
      order,
      'CITIZEN_REPORT',
      investigationId,
      uploadedById,
      category,
      reliability,
      justification,
      authoritySourceId,
    )
  }

  static updateDirectorInboxSourceInInvestigationMedia(
    investigationMedia: InvestigationMedia,
    url: string,
    type: MediaType,
    order: number,
    investigationId: string,
    uploadedById: string,
    category?: MediaCategory,
    reliability?: Verdict,
    justification?: string,
    authoritySourceId?: string,
  ): InvestigationMedia {
    return investigationMedia.updateInvestigationMedia(
      investigationMedia.id,
      url,
      type,
      order,
      'DIRECTOR_INITIATED',
      investigationId,
      uploadedById,
      category,
      reliability,
      justification,
      authoritySourceId,
    )
  }

  static updateJournalistInvestigationMedia(
    investigationMedia: InvestigationMedia,
    url: string,
    type: MediaType,
    order: number,
    investigationId: string,
    uploadedById: string,
    authoritySourceId: string,
  ): InvestigationMedia {
    return investigationMedia.updateInvestigationMedia(
      investigationMedia.id,
      url,
      type,
      order,
      'JOURNALIST_PROOF',
      investigationId,
      uploadedById,
      undefined,
      undefined,
      undefined,
      authoritySourceId,
    )
  }
}

// Evidence Media

export interface CreateEvidenceMediaParams {
  id: number
  order: number
  evidenceId: string
  url: string
  type: MediaType
  uploadedById: string
  category?: MediaCategory
  reliability?: Verdict
  justification?: string
}

export class EvidenceMediaFactory {
  static create(params: CreateEvidenceMediaParams): EvidenceMedia {
    return new EvidenceMedia(
      params.id,
      params.url,
      params.type,
      params.order,
      params.evidenceId,
      params.uploadedById,
      params.category || undefined,
      params.reliability || undefined,
      params.justification || undefined,
    )
  }

  static createFromWatcher(
    id: number,
    order: number,
    uploadedById: string,
    evidenceId: string,
    url: string,
    type: MediaType,
    category?: MediaCategory,
    reliability?: Verdict,
    justification?: string,
  ): EvidenceMedia {
    return this.create({
      id,
      order,
      evidenceId,
      url,
      type,
      uploadedById,
      category,
      reliability,
      justification,
    })
  }

  static updateWatcherEvidenceMedia(
    evidenceMedia: EvidenceMedia,
    url: string,
    type: MediaType,
    order: number,
    category: MediaCategory,
    reliability: Verdict,
    justification: string,
  ): void {
    evidenceMedia.changeCategory(category)
    evidenceMedia.changeReliability(reliability)
    evidenceMedia.changeJustification(justification)
    evidenceMedia.changeUrl(url)
    evidenceMedia.changeType(type)
    evidenceMedia.changeOrder(order)
  }
}

// Verified Media (in Publication)

export interface CreateVerifiedMediaParams {
  id: number
  order: number
  publicationId: string
  url: string
  type: MediaType
  uploadedById: string
  authoritySourceId?: string
}

export class VerifiedMediaFactory {
  static create(params: CreateVerifiedMediaParams): VerifiedMedia {
    return new VerifiedMedia(
      params.id,
      params.url,
      params.type,
      params.order,
      params.publicationId,
      params.uploadedById,
      params.authoritySourceId,
      new Date(),
      new Date(),
    )
  }

  static createForPublication(
    id: number,
    order: number,
    publicationId: string,
    url: string,
    type: MediaType,
    uploadedById: string,
    authoritySourceId?: string,
  ): VerifiedMedia {
    return this.create({
      id,
      order,
      publicationId,
      url,
      type,
      uploadedById,
      authoritySourceId,
    })
  }

  static updateVerifiedMedia(
    verifiedMedia: VerifiedMedia,
    url: string,
    type: MediaType,
    order: number,
    authoritySourceId?: string,
  ): void {
    verifiedMedia.changeUrl(url)
    verifiedMedia.changeType(type)
    verifiedMedia.changeOrder(order)
    verifiedMedia.changeAuthoritySourceId(authoritySourceId)
  }
}

// VerifiedLink

export interface CreateVerifiedLinkParams {
  id: number
  publicationId: string
  url: string
  uploadedById: string
  authoritySourceId?: string
}

export class VerifiedLinkFactory {
  static create(params: CreateVerifiedLinkParams): VerifiedLink {
    return new VerifiedLink(
      params.id,
      params.url,
      params.publicationId,
      params.uploadedById,
      params.authoritySourceId,
      new Date(),
      new Date(),
    )
  }

  static createForPublication(
    id: number,
    publicationId: string,
    url: string,
    uploadedById: string,
    authoritySourceId?: string,
  ): VerifiedLink {
    return this.create({
      id,
      publicationId,
      url,
      uploadedById,
      authoritySourceId,
    })
  }

  static updateVerifiedLink(
    verifiedLink: VerifiedLink,
    url: string,
    authoritySourceId?: string,
  ): void {
    verifiedLink.changeAuthoritySourceId(authoritySourceId)
    verifiedLink.changeUrl(url)
  }
}

// Inbox Subject Media

export interface CreateSubjectInboxMediaParams {
  id: number
  url: string
  type: MediaType
  order: number
  inboxSubjectId: string
  uploadedById: string
  origin?: InboxSubjectMediaOrigin
}

export class InboxSubjectMediaFactory {
  static create(params: CreateSubjectInboxMediaParams): InboxSubjectMedia {
    return new InboxSubjectMedia(
      params.id,
      params.url,
      params.type,
      params.order,
      params.inboxSubjectId,
      params.uploadedById,
      params.origin ?? 'DIRECTOR_INITIATED',
      new Date(),
      new Date(),
    )
  }
}
