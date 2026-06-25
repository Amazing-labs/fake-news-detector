// application/services/ActorManagementService.ts
//
// Director-driven journalist and citizen lifecycle (create, ban, disable, activate).

import {
  type ICitizenRepository,
  type IDirectorRepository,
  type IJournalistRepository,
} from '../../domain/repositories'
import { JournalistFactory } from '../../domain/factories/JournalistFactory'
import { Citizen } from '../../domain/entities/Citizen'
import { Director } from '../../domain/entities/Director'
import {
  Journalist,
  JournalistStatusReason,
} from '../../domain/entities/Journalist'
import type { StatusReason } from '../../shared/types'
import {
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors'

export class ActorManagementService {
  constructor(
    private readonly directorRepository: IDirectorRepository,
    private readonly journalistRepository: IJournalistRepository,
    private readonly citizenRepository: ICitizenRepository,
  ) {}

  async listJournalists(): Promise<Journalist[]> {
    return this.journalistRepository.findAll()
  }

  async listCitizens(): Promise<Citizen[]> {
    return this.citizenRepository.findAll()
  }

  async createJournalist(
    directorId: string,
    name: string,
    email: string,
  ): Promise<string> {
    if (!name.trim()) throw new ValidationError('Journalist name is required')
    if (!email.trim()) throw new ValidationError('Journalist email is required')
    const normalizedEmail = email.trim().toLowerCase()

    await this.getActiveDirector(directorId)

    const existing =
      await this.journalistRepository.findByEmail(normalizedEmail)
    if (existing) {
      throw new BusinessRuleError('A journalist with this email already exists')
    }

    const journalist = JournalistFactory.createFromRegistration(
      name.trim(),
      normalizedEmail,
    )
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

  async banCitizen(
    directorId: string,
    citizenId: string,
    reason: StatusReason,
    details?: string,
  ): Promise<void> {
    const director = await this.getActiveDirector(directorId)
    const citizen = await this.getCitizen(citizenId)
    director.banCitizen(citizen, reason, details)
    await this.citizenRepository.update(citizen)
  }

  async disableCitizen(
    directorId: string,
    citizenId: string,
    reason: StatusReason,
    details?: string,
  ): Promise<void> {
    const director = await this.getActiveDirector(directorId)
    const citizen = await this.getCitizen(citizenId)
    director.disableCitizen(citizen, reason, details)
    await this.citizenRepository.update(citizen)
  }

  async activateCitizen(directorId: string, citizenId: string): Promise<void> {
    const director = await this.getActiveDirector(directorId)
    const citizen = await this.getCitizen(citizenId)
    director.activateCitizen(citizen)
    await this.citizenRepository.update(citizen)
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

  private async getCitizen(citizenId: string): Promise<Citizen> {
    const citizen = await this.citizenRepository.findById(citizenId)
    if (!citizen) throw new NotFoundError('Citizen', citizenId)
    return citizen
  }
}
