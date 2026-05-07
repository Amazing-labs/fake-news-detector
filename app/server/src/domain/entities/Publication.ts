// domain/entities/Publication.ts

import { Verdict } from './Investigation'
import { VerifiedLink, VerifiedMedia } from '../value-objects'

export class Publication {
  constructor(
    public readonly id: string,
    public investigationId: string,
    public approvedById: string,
    public finalVerdict: Verdict,
    public publishedAt: Date = new Date(),
    public isCorrection: boolean = false,
    public readonly verifiedLinks: ReadonlyArray<VerifiedLink> = Object.freeze([]),
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
