export class Correction {
  constructor(
    public readonly id: string,
    public notificationId: string,
    public publicationId: string,
    public title: string,
    public content: string,
    public correctedById: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  updateContent(title: string, content: string): void {
    this.title = title
    this.content = content
    this.updatedAt = new Date()
  }
}
