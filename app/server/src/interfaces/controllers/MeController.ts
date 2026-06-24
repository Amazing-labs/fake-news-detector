import type { Context } from 'hono'
import type {
  ICitizenRepository,
  IDirectorRepository,
  IJournalistRepository,
} from '../../domain/repositories'
import { NotFoundError } from '../../shared/errors'
import { ok } from '../http/responses'
import type { AppVariables } from '../http/types'

export class MeController {
  constructor(
    private readonly citizenRepository: ICitizenRepository,
    private readonly journalistRepository: IJournalistRepository,
    private readonly directorRepository: IDirectorRepository,
  ) {}

  getMe = async (c: Context<{ Variables: AppVariables }>) => {
    const actor = c.get('actor')

    if (actor.actorRole === 'CITIZEN') {
      const citizen = await this.citizenRepository.findById(actor.actorId)
      if (!citizen) throw new NotFoundError('Citizen', actor.actorId)
      return ok(c, {
        id: citizen.id,
        role: 'CITIZEN' as const,
        name: citizen.name,
        email: citizen.email,
        status: citizen.status,
        citizenType: citizen.citizenType,
        engagementScore: citizen.engagementScore,
        openReportsCount: citizen.openReportsCount,
        statusReason: citizen.statusReason,
        statusReasonDetails: citizen.statusReasonDetails,
        createdAt: citizen.createdAt.toISOString(),
        updatedAt: citizen.updatedAt.toISOString(),
      })
    }

    if (actor.actorRole === 'JOURNALIST') {
      const journalist = await this.journalistRepository.findById(actor.actorId)
      if (!journalist) throw new NotFoundError('Journalist', actor.actorId)
      return ok(c, {
        id: journalist.id,
        role: 'JOURNALIST' as const,
        name: journalist.name,
        email: journalist.email,
        status: journalist.status,
        engagementScore: journalist.engagementScore,
        activeInvestigationsCount: journalist.activeInvestigationsCount,
        statusReason: journalist.statusReason,
        statusReasonDetails: journalist.statusReasonDetails,
        createdAt: journalist.createdAt.toISOString(),
        updatedAt: journalist.updatedAt.toISOString(),
      })
    }

    const director = await this.directorRepository.findById(actor.actorId)
    if (!director) throw new NotFoundError('Director', actor.actorId)
    return ok(c, {
      id: director.id,
      role: 'EDITORIAL_DIRECTOR' as const,
      name: director.name,
      email: director.email,
      status: director.status,
      createdAt: director.createdAt.toISOString(),
      updatedAt: director.updatedAt.toISOString(),
    })
  }
}
