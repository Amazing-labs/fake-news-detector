// domain/value-objects/Media.ts

import { BusinessRuleError } from '../../shared'

export type MediaType =
  | 'AUDIO'
  | 'LINK'
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
export type MediaCategory =
  | 'CONTEXT_COLLAPSE'
  | 'MANIPULATED'
  | 'FABRICATED'
  | 'SATIRE'
  | 'MISLEADING'
  | 'IMPOSTOR'
  | 'OTHER'
export type MediaOrigin =
  | 'CITIZEN_REPORT'
  | 'JOURNALIST_PROOF'
  | 'DIRECTOR_INITIATED'
export type Verdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNVERIFIABLE'

export type InboxSubjectMediaOrigin = 'DIRECTOR_INITIATED'

// Report Media (from Citizen)
export class ReportMedia {
  constructor(
    public readonly id: number,
    public url: string,
    public type: MediaType,
    public order: number,
    public reportId: string,
    public uploadedById: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}

// Investigation Media (from Journalist)
export class InvestigationMedia {
  constructor(
    public readonly id: number,
    public url: string,
    public type: MediaType,
    public order: number,
    public origin: MediaOrigin,
    public investigationId: string,
    public uploadedById: string,
    public category?: MediaCategory,
    public reliability?: Verdict,
    public justification?: string,
    public authoritySourceId?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this.validateConsistency()
  }

  requiresJournalistClassification(): boolean {
    return (
      this.origin === 'CITIZEN_REPORT' || this.origin === 'DIRECTOR_INITIATED'
    )
  }

  isFromJournalistProof(): boolean {
    return this.origin === 'JOURNALIST_PROOF'
  }

  private validateConsistency(): void {
    if (this.isFromJournalistProof()) {
      if (this.category || this.reliability || this.justification) {
        throw new BusinessRuleError(
          'JOURNALIST_PROOF cannot define category, reliability, or justification',
        )
      }
      if (!this.authoritySourceId) {
        throw new BusinessRuleError(
          'JOURNALIST_PROOF requires an authority source',
        )
      }
    }
  }

  submitReliabilityVerdict(reliability: Verdict): void {
    if (!this.requiresJournalistClassification()) {
      throw new BusinessRuleError(
        'Journalist can submit reliability verdict only for source media (citizen or director inbox)',
      )
    }

    this.reliability = reliability
    this.updatedAt = new Date()
  }
  submitCategory(category: MediaCategory): void {
    if (!this.requiresJournalistClassification()) {
      throw new BusinessRuleError(
        'Journalist can submit media category only for source media (citizen or director inbox)',
      )
    }
    this.category = category
    this.updatedAt = new Date()
  }
  submitJustification(justification: string): void {
    if (!this.requiresJournalistClassification()) {
      throw new BusinessRuleError(
        'Journalist can submit justification only for source media (citizen or director inbox)',
      )
    }
    this.justification = justification
    this.updatedAt = new Date()
  }

  submitAuthoritySource(authoritySource: string): void {
    if (!this.isFromJournalistProof()) {
      throw new BusinessRuleError(
        'Journalist can submit authority source only if origin = JOURNALIST_PROOF',
      )
    }
    if (!authoritySource) {
      throw new BusinessRuleError('Authority source is required')
    }
    this.authoritySourceId = authoritySource
    this.updatedAt = new Date()
  }

  updateInvestigationMedia(
    investigationMediaId: number,
    url: string,
    type: MediaType,
    order: number,
    origin: MediaOrigin,
    investigationId: string,
    uploadedById: string,
    category?: MediaCategory,
    reliability?: Verdict,
    justification?: string,
    authoritySourceId?: string,
  ): InvestigationMedia {
    if (investigationMediaId !== this.id) {
      throw new BusinessRuleError(
        "Cannot update investigation media: id doesn't match",
      )
    }
    if (investigationId !== this.investigationId) {
      throw new BusinessRuleError(
        "Cannot update investigation media: investigationId doesn't match",
      )
    }
    if (uploadedById !== this.uploadedById) {
      throw new BusinessRuleError(
        "Cannot update investigation media: uploader id doesn't match",
      )
    }

    this.url = url
    this.type = type
    this.order = order
    this.origin = origin
    this.uploadedById = uploadedById

    if (origin === 'CITIZEN_REPORT' || origin === 'DIRECTOR_INITIATED') {
      this.category = category
      this.reliability = reliability
      this.justification = justification
      this.authoritySourceId = authoritySourceId
    } else {
      this.category = undefined
      this.reliability = undefined
      this.justification = undefined
      this.authoritySourceId = authoritySourceId
    }

    this.validateConsistency()
    this.updatedAt = new Date()
    return this
  }
}

// Evidence Media (from Watcher)
export class EvidenceMedia {
  constructor(
    public readonly id: number,
    public url: string,
    public type: MediaType,
    public order: number,
    public evidenceId: string,
    public uploadedById: string,
    public category?: MediaCategory,
    public reliability?: Verdict,
    public justification?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  changeCategory(category: MediaCategory): void {
    this.category = category
    this.updatedAt = new Date()
  }

  changeReliability(reliability: Verdict): void {
    this.reliability = reliability
    this.updatedAt = new Date()
  }

  changeJustification(justification: string): void {
    this.justification = justification
    this.updatedAt = new Date()
  }

  changeUrl(url: string): void {
    this.url = url
    this.updatedAt = new Date()
  }

  changeType(type: MediaType): void {
    this.type = type
    this.updatedAt = new Date()
  }

  changeOrder(order: number): void {
    this.order = order
    this.updatedAt = new Date()
  }
}

// Inbox Subject Media
export class InboxSubjectMedia {
  constructor(
    public readonly id: number,
    public url: string,
    public type: MediaType,
    public order: number,
    public inboxSubjectId: string,
    public uploadedById: string,
    public origin: InboxSubjectMediaOrigin = 'DIRECTOR_INITIATED',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}

// Verified Media (in Publication)
export class VerifiedMedia {
  constructor(
    public readonly id: number,
    public url: string,
    public type: MediaType,
    public order: number,
    public publicationId: string,
    public addedById: string,
    public authoritySourceId?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  changeAuthoritySourceId(authoritySourceId?: string): void {
    this.authoritySourceId = authoritySourceId
    this.updatedAt = new Date()
  }

  changeUrl(url: string): void {
    this.url = url
    this.updatedAt = new Date()
  }

  changeType(type: MediaType): void {
    this.type = type
    this.updatedAt = new Date()
  }

  changeOrder(order: number): void {
    this.order = order
    this.updatedAt = new Date()
  }
}

// Verified Link (in Publication)
export class VerifiedLink {
  constructor(
    public readonly id: number,
    public url: string,
    public publicationId: string,
    public addedById: string,
    public authoritySourceId?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  changeAuthoritySourceId(authoritySourceId?: string): void {
    this.authoritySourceId = authoritySourceId
    this.updatedAt = new Date()
  }

  changeUrl(url: string): void {
    this.url = url
    this.updatedAt = new Date()
  }
}
