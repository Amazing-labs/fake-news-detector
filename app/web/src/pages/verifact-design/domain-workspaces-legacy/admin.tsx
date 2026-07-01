import { Link } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { AppLayout } from '../app-layout'
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

export function GuestHomePage() {
  return (
    <AppLayout actor="guest" page="dashboard">
      <div className="grid gap-6 xl:grid-cols-3">
        {[
          ['Citoyen', 'Dépose un signalement ou candidate comme vigie.'],
          ['Journaliste', 'Prend un sujet et prepare le dossier.'],
          ['Direction', 'Arbitre, publie, archive ou demande une correction.'],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Connecte-toi pour ouvrir l'espace adapté à ton rôle.
            </CardDescription>
            <CardAction>
              <Button asChild>
                <Link to="/auth" search={{ mode: 'sign-in' }}>
                  <ShieldCheck />
                  Connexion
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </AppLayout>
  )
}
