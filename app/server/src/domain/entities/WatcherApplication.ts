export type WatcherApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export class WatcherApplication {
  constructor(
    public readonly id: string,
    public actorId: string,
    public motivation: string,
    public status: WatcherApplicationStatus = 'PENDING',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  approve(): void {
    this.status = 'APPROVED'
    this.updatedAt = new Date()
  }

  reject(): void {
    this.status = 'REJECTED'
    this.updatedAt = new Date()
  }

  changeStatus(newStatus: WatcherApplicationStatus): void {
    this.status = newStatus
    this.updatedAt = new Date()
  }
}
