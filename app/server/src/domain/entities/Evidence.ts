// domain/entities/Evidence.ts

import type { EvidenceMedia } from '../value-objects/Media'

export class Evidence {
  constructor(
    public readonly id: string,
    public content: string,
    public title: string,
    public investigationId: string,
    public watcherId: string,
    public media: EvidenceMedia[] = [],
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  updateContent(title: string, content: string): void {
    this.title = title
    this.content = content
    this.updatedAt = new Date()
  }
}
