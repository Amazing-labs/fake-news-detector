import {
  PeopleManagementPage as PeopleManagementWorkspace,
  UserCreateWorkspacePage as UserCreateWorkspace,
} from '../workspaces/people-management-page'
import { WatcherApplicationsReviewPage as WatcherApplicationsReviewWorkspace } from '../workspaces/watcher-applications-review-page'
import {
  NotificationDetailWorkspacePage as NotificationDetailWorkspace,
  NotificationsWorkspacePage as NotificationsWorkspace,
} from '../workspaces/notifications-workspace-page'

export function PeopleManagementPage() {
  return <PeopleManagementWorkspace />
}

export function UserCreateWorkspacePage() {
  return <UserCreateWorkspace />
}

export function WatcherApplicationsReviewPage() {
  return <WatcherApplicationsReviewWorkspace />
}

export function NotificationsWorkspacePage() {
  return <NotificationsWorkspace />
}

export function NotificationDetailWorkspacePage({
  notificationId,
}: {
  notificationId: string
}) {
  return <NotificationDetailWorkspace notificationId={notificationId} />
}
