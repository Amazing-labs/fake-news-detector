// domain/entities/AuthoritySource.ts

export type SourceType =
  | 'OFFICIAL_DECREE'
  | 'ORIGINAL_RETRACTION'
  | 'DIRECT_EVIDENCE'
  | 'MEDIA_CROSSCHECK'
  | 'AUTHORITY_STATEMENT'

export class AuthoritySource {
  constructor(
    public readonly id: string,
    public name: string,
    public type: SourceType,
    public readonly createdAt: Date = new Date(),
  ) {}

  isOfficial(): boolean {
    return (
      this.type === 'OFFICIAL_DECREE' || this.type === 'AUTHORITY_STATEMENT'
    )
  }

  isMedia(): boolean {
    return this.type === 'MEDIA_CROSSCHECK'
  }
}
