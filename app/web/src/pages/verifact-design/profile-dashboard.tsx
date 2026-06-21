import type { ReactNode } from 'react'
import { formatActorStatus } from '@entities/session/model'
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/shadcn/avatar'
import { Badge } from '@shared/ui/shadcn/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { CheckCircle2, ShieldCheck, Trophy } from 'lucide-react'
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
          className="mx-auto w-full max-w-4xl"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">
              Vérification de session…
            </p>
          </CardContent>
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
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <Card>
          <CardContent className="pt-6">
            {/* Identity row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="ring-border size-16 shrink-0 ring-2">
                <AvatarImage
                  src={session?.user.image ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {initials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold">{displayName}</h1>
                  <Badge variant="secondary">{roleLabel}</Badge>
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">{email}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatCell
                icon={<ShieldCheck className="size-4" />}
                label="Rôle"
                value={roleLabel}
              />
              <StatCell
                icon={<CheckCircle2 className="size-4" />}
                label="Statut"
                value={statusLabel}
              />
              <StatCell
                icon={<Trophy className="size-4" />}
                label="Score contribution"
                value={String(contribution.score)}
                sub={contribution.detail}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <WorkTable actor={actor} />
          </TabsContent>

          <TabsContent value="account" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations du compte</CardTitle>
                <CardDescription>
                  Paramètres et préférences liés à votre profil.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Nom d'affichage" value={displayName} />
                  <InfoRow label="Adresse e-mail" value={email} />
                  <InfoRow label="Rôle" value={roleLabel} />
                  <InfoRow label="Statut du compte" value={statusLabel} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

function StatCell({
  icon,
  label,
  value,
  sub,
  children,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
  children?: ReactNode
}) {
  return (
    <div className="bg-muted/40 rounded-xl border p-4">
      <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold">{value}</p>
      {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
