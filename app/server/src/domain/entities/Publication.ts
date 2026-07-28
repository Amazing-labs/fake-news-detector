import type { Verdict } from './Investigation'
import { VerifiedLink, VerifiedMedia } from '../value-objects'

export class Publication {
  constructor(
    public readonly id: string,
    public investigationId: string,
    public approvedById: string,
    public finalVerdict: Verdict,
    /**
     * Editorial statement the director signs off with — never empty when set.
     * `null` only for dossiers arbitrated before the statement became
     * mandatory: those were never signed, and are not pretended to be.
     */
    public publicationNotes: string | null,
    public publishedAt: Date = new Date(),
    public isCorrection: boolean = false,
    public readonly verifiedLinks: ReadonlyArray<VerifiedLink> = Object.freeze(
      [],
    ),
    public readonly verifiedMedia: ReadonlyArray<VerifiedMedia> = Object.freeze(
      [],
    ),
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this.verifiedLinks = Object.freeze([...verifiedLinks])
    this.verifiedMedia = Object.freeze([...verifiedMedia])
  }

  markAsCorrection(): void {
    this.isCorrection = true
    this.updatedAt = new Date()
  }

  hasVerifiedEvidence(): boolean {
    return this.verifiedLinks.length > 0 || this.verifiedMedia.length > 0
  }

  generateBadgeNotification(): string {
    return `New publication: ${this.finalVerdict}`
  }
}
