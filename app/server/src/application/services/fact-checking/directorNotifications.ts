import type {
  IDirectorRepository,
  INotificationRepository,
} from '../../../domain/repositories'
import { NotificationFactory } from '../../../domain/factories/NotificationFactory'

// Inform every active editorial director about pipeline activity it should be
// aware of (an investigation opened, one is ready for arbitration, a watcher
// applied…). These are INFO-level (awareness, not pressure). No-op when no
// active director exists.
export async function notifyActiveDirectors(
  directorRepository: IDirectorRepository,
  notificationRepository: INotificationRepository,
  theme: string,
  message: string,
): Promise<void> {
  const directors = await directorRepository.findAll()
  const activeDirectors = directors.filter((director) => director.isActive())
  if (activeDirectors.length === 0) return

  const notifications = activeDirectors.map((director) =>
    NotificationFactory.createAlertNotification(
      director.id,
      theme,
      message,
      'INFO',
    ),
  )
  await notificationRepository.saveMany(notifications)
}
