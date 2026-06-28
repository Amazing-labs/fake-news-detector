// domain/repositories/ICorrectionRepository.ts
import { Correction } from '../entities/Correction'

export interface ICorrectionRepository {
  save(correction: Correction): Promise<void>
  findById(id: string): Promise<Correction | null>
  findByPublicationId(publicationId: string): Promise<Correction[]>
  findByPublicationIds(publicationIds: string[]): Promise<Correction[]>
  findByNotificationId(notificationId: string): Promise<Correction | null>
  findByCorrectedBy(correctedById: string): Promise<Correction[]>
  update(correction: Correction): Promise<void>
  delete(id: string): Promise<void>
}
