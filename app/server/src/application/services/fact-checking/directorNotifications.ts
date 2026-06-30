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

  // Best-effort: this fan-out is a secondary side-effect of an already-committed
  // business action. A transient notification outage must not turn that success
  // into a 500 for the caller, so we swallow (and log) persistence failures.
  try {
    await notificationRepository.saveMany(notifications)
  } catch (error) {
    console.error('Failed to notify active directors', error)
  }
}
