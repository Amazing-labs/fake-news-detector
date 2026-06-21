import { Link } from '@tanstack/react-router'
import { Ban, ShieldCheck } from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
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

export function UserStatusWorkspacePage({ userLabel }: { userLabel?: string }) {
  const isActive = userLabel !== 'Malik Sissoko'

  return (
    <AppLayout actor="director" page="people">
      <Card>
        <CardHeader>
          <CardTitle>{userLabel ?? 'Compte sélectionné'}</CardTitle>
          <CardDescription>
            Modifier le statut sans exposer les identifiants internes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Label className="grid gap-2">
            Raison
            <select className="border-input bg-background h-10 rounded-md border px-3 text-sm">
              <option value="ABUSE">Abus de la plateforme</option>
              <option value="INACTIVE">Compte inactif</option>
              <option value="SECURITY">Risque de securite</option>
              <option value="OTHER">Autre</option>
            </select>
          </Label>
          <Label className="grid gap-2">
            Détails
            <Textarea placeholder="Commentaire interne" />
          </Label>
          <div className="flex flex-wrap gap-2">
            {isActive ? (
              <Button variant="outline">Desactiver</Button>
            ) : (
              <Button>Activer</Button>
            )}
            <Button variant="destructive">
              <Ban />
              Bannir
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
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
