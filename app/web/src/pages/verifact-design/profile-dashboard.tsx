import { useNavigate } from '@tanstack/react-router'
import {
  formatActorStatus,
  signOutAppSession,
} from '../../entities/session/model'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../shared/ui/shadcn/avatar'
import { Button } from '../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import { AppLayout } from './app-layout'
import { initials, sessionRoleLabel, useResolvedActor } from './session-routing'
import type { Actor } from './types'
import { WorkTable } from './work-table'

const contributionScores: Record<Actor, { score: number; detail: string }> = {
  guest: { score: 0, detail: 'session invitée' },
  citizen: { score: 42, detail: 'signalements utiles' },
  watcher: { score: 68, detail: 'preuves relues' },
  journalist: { score: 81, detail: 'dossiers documentés' },
  director: { score: 89, detail: 'arbitrages finalisés' },
  admin: { score: 74, detail: 'comptes maintenus' },
}

export function ProfileDashboard() {
  const { session, actor } = useResolvedActor('journalist')
  const navigate = useNavigate()
  const displayName = session?.user.name ?? 'Utilisateur'
  const email = session?.user.email ?? 'Session invitée'
  const roleLabel = sessionRoleLabel(session, actor)
  const statusLabel = formatActorStatus(session?.user.actorStatus)
  const contribution = contributionScores[actor]

  async function handleSignOut() {
    await signOutAppSession()
    await navigate({ to: '/auth', search: { mode: 'sign-in' } })
  }

  return (
    <AppLayout actor={actor} page="profile">
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identite</CardTitle>
            <CardDescription>Redaction connectee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-end">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage
                      src={session?.user.image ?? undefined}
                      alt={displayName}
                    />
                    <AvatarFallback>{initials(displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                      {displayName}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {email}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Role
                    </p>
                    <p className="mt-1 text-base leading-tight font-medium">
                      {roleLabel}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Statut
                    </p>
                    <p className="mt-1 text-base leading-tight font-medium">
                      {statusLabel}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs font-medium uppercase">
                      Score contribution
                    </p>
                    <p className="mt-1 text-base leading-tight font-medium">
                      {contribution.score}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {contribution.detail}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => void handleSignOut()}
              >
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>
        <WorkTable actor={actor} />
      </div>
    </AppLayout>
  )
}
