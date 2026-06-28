import type {
  IDirectorRepository,
  INotificationRepository,
} from '../../../domain/repositories'
import { NotificationFactory } from '../../../domain/factories/NotificationFactory'

// Fan an ALERT out to every active editorial director so the desk is aware of
// pipeline activity it should react to (an investigation opened, one is ready
// for arbitration, a watcher applied…). No-op when no active director exists.
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
    NotificationFactory.createAlertNotification(director.id, theme, message),
  )
  await notificationRepository.saveMany(notifications)
}
