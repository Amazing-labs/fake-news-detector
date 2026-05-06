// domain/entities/Report.ts

export type ReportStatus = 'OPEN' | 'ARCHIVED'

export class Report {
  constructor(
    public readonly id: string,
    public citizenId: string,
    public theme: string,
    public title: string | null = null,
    public content: string | null = null,
    public status: ReportStatus = 'OPEN',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  isOpen(): boolean {
    return this.status === 'OPEN'
  }

  canBeArchived(): boolean {
    return this.status === 'OPEN'
  }

  // Actions
  changeStatus(newStatus: ReportStatus): void {
    this.status = newStatus
    this.updatedAt = new Date()
  }

  updateContent(
    title: string | null,
    content: string | null,
    theme: string,
  ): void {
    this.title = title
    this.content = content
    this.theme = theme
    this.updatedAt = new Date()
  }
}
