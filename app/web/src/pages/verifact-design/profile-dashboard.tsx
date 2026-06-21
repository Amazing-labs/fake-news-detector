import { formatActorStatus } from '@entities/session/model'
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/shadcn/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
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
  const { session, actor, isActorPending } = useResolvedActor('journalist')

  if (isActorPending) {
    return (
      <AppLayout actor="guest" page="profile">
        <Card
          className="mx-auto w-full max-w-5xl"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <CardHeader>
            <CardTitle>Vérification de session</CardTitle>
            <CardDescription>
              Lecture du rôle avant d’afficher le profil.
            </CardDescription>
          </CardHeader>
        </Card>
      </AppLayout>
    )
  }

  const displayName = session?.user.name ?? 'Utilisateur'
  const email = session?.user.email ?? 'Session invitée'
  const roleLabel = sessionRoleLabel(session, actor)
  const statusLabel = formatActorStatus(session?.user.actorStatus)
  const contribution = contributionScores[actor]

  return (
    <AppLayout actor={actor} page="profile">
      <div className="mx-auto grid w-full max-w-5xl gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] xl:items-stretch">
              <div className="bg-muted/40 flex min-w-0 items-center gap-5 rounded-xl border p-5">
                <Avatar className="size-16 shrink-0">
                  <AvatarImage
                    src={session?.user.image ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold">
                    {displayName}
                  </p>
                  <p className="text-muted-foreground truncate text-sm">
                    {email}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Role
                  </p>
                  <p className="mt-2 text-base leading-tight font-medium">
                    {roleLabel}
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Statut
                  </p>
                  <p className="mt-2 text-base leading-tight font-medium">
                    {statusLabel}
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Score contribution
                  </p>
                  <p className="mt-2 text-base leading-tight font-medium">
                    {contribution.score}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {contribution.detail}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <WorkTable actor={actor} />
      </div>
    </AppLayout>
  )
}
