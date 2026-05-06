// application/services/ActorManagementService.ts
//
// Director-driven journalist lifecycle (create, ban, disable, activate).

import {
  type IDirectorRepository,
  type IJournalistRepository,
} from '../../domain/repositories'
import { JournalistFactory } from '../../domain/factories/JournalistFactory'
import { Director } from '../../domain/entities/Director'
import {
  Journalist,
  JournalistStatusReason,
} from '../../domain/entities/Journalist'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors'

export class ActorManagementService {
  constructor(
    private readonly directorRepository: IDirectorRepository,
    private readonly journalistRepository: IJournalistRepository,
  ) {}

  async createJournalist(
    directorId: string,
    name: string,
    email: string,
  ): Promise<string> {
    if (!name.trim()) throw new ValidationError('Journalist name is required')
    if (!email.trim()) throw new ValidationError('Journalist email is required')

    await this.getActiveDirector(directorId)

    const existing = await this.journalistRepository.findByEmail(email)
    if (existing) {
      throw new BusinessRuleError('A journalist with this email already exists')
    }

    const journalist = JournalistFactory.createFromRegistration(name, email)
    await this.journalistRepository.save(journalist)
    return journalist.id
  }

  async banJournalist(
    directorId: string,
    journalistId: string,
    reason: JournalistStatusReason,
    details?: string,
  ): Promise<void> {
    const director = await this.getActiveDirector(directorId)
    const journalist = await this.getJournalist(journalistId)
    director.banJournalist(journalist, reason, details)
    await this.journalistRepository.update(journalist)
  }

  async disableJournalist(
    directorId: string,
    journalistId: string,
    reason: JournalistStatusReason,
    details?: string,
  ): Promise<void> {
    const director = await this.getActiveDirector(directorId)
    const journalist = await this.getJournalist(journalistId)
    director.disableJournalist(journalist, reason, details)
    await this.journalistRepository.update(journalist)
  }

  async activateJournalist(
    directorId: string,
    journalistId: string,
  ): Promise<void> {
    const director = await this.getActiveDirector(directorId)
    const journalist = await this.getJournalist(journalistId)
    director.activateJournalist(journalist)
    await this.journalistRepository.update(journalist)
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async getActiveDirector(directorId: string): Promise<Director> {
    const director = await this.directorRepository.findById(directorId)
    if (!director) throw new NotFoundError('Director', directorId)
    if (!director.isActive()) {
      throw new BusinessRuleError('Director account is not active')
    }
    return director
  }

  private async getJournalist(journalistId: string): Promise<Journalist> {
    const journalist = await this.journalistRepository.findById(journalistId)
    if (!journalist) throw new NotFoundError('Journalist', journalistId)
    return journalist
  }
}
