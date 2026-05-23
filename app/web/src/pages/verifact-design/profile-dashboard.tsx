import { useNavigate } from '@tanstack/react-router'
import { formatActorStatus } from '../../entities/session/model'
import { authClient } from '../../lib/auth-client'
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
import { WorkTable } from './work-table'

export function ProfileDashboard() {
  const { session, actor } = useResolvedActor('journalist')
  const navigate = useNavigate()
  const displayName = session?.user.name ?? 'Utilisateur'
  const email = session?.user.email ?? 'Session invitee'
  const roleLabel = sessionRoleLabel(session, actor)
  const statusLabel = formatActorStatus(session?.user.actorStatus)

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: '/auth', search: { mode: 'sign-in' } })
  }

  return (
    <AppLayout actor={actor} page="profile">
      <div className="mx-auto grid w-full max-w-6xl gap-8 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Card className="xl:sticky xl:top-24 xl:self-start">
          <CardHeader>
            <CardTitle>Identite</CardTitle>
            <CardDescription>Redaction connectee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage
                  src={session?.user.image ?? ''}
                  alt={displayName}
                />
                <AvatarFallback>{initials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{displayName}</p>
                <p className="text-muted-foreground truncate text-sm">
                  {email}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void handleSignOut()}
            >
              Deconnexion
            </Button>
          </CardContent>
        </Card>
        <WorkTable />
      </div>
    </AppLayout>
  )
}
