import type { Context } from 'hono'
import type {
  IInvestigationRepository,
  INotificationRepository,
  IPublicationRepository,
} from '../../domain/repositories'
import { ok } from '../http/responses'
import type { AppVariables } from '../http/types'
import { presentDirectorDashboard } from '../presenters/directorPresenter'

export class DirectorController {
  constructor(
    private readonly investigationRepository: IInvestigationRepository,
    private readonly publicationRepository: IPublicationRepository,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  getDashboard = async (c: Context<{ Variables: AppVariables }>) => {
    const [pendingReviews, publishedCount, totalNotifications] =
      await Promise.all([
        this.investigationRepository.findPendingReviews(),
        this.publicationRepository.count(),
        this.notificationRepository.count(),
      ])

    return ok(
      c,
      presentDirectorDashboard({
        pendingReviews,
        publishedCount,
        totalNotifications,
      }),
    )
  }
}
