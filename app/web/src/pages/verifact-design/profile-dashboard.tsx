import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  dashboardQueryKeys,
  getDashboardMetrics,
} from '@entities/dashboard/api'
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
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileSearch,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { AppLayout } from './app-layout'
import { initials, sessionRoleLabel, useResolvedActor } from './session-routing'
import { DoubleBorderCard } from './workspace-ui'
import { WorkTable } from './work-table'

const roleThemes: Record<string, { icon: typeof ShieldCheck; color: string; label: string }> = {
  journalist: { icon: FileSearch, color: 'text-chart-2', label: 'Journaliste' },
  director: { icon: ShieldCheck, color: 'text-chart-3', label: 'Directeur' },
  citizen: { icon: Clock, color: 'text-chart-4', label: 'Citoyen' },
  watcher: { icon: BadgeCheck, color: 'text-sky-500', label: 'Vigie' },
}

export function ProfileDashboard() {
  const { session, actor, isActorPending } = useResolvedActor('journalist')
  const metricsQuery = useQuery({
    queryKey: dashboardQueryKeys.metrics(),
    queryFn: getDashboardMetrics,
    enabled: actor !== 'guest',
  })
  const contributionScore = metricsQuery.data?.contributionScore

  if (isActorPending) {
    return (
      <AppLayout actor="guest" page="profile">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="border-primary/30 size-10 animate-spin rounded-full border-2 border-t-primary" />
            <p className="text-muted-foreground text-sm">Vérification de session…</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const displayName = session?.user.name ?? 'Utilisateur'
  const email = session?.user.email ?? 'Session invitée'
  const roleLabel = sessionRoleLabel(session, actor)
  const statusLabel = formatActorStatus(session?.user.actorStatus)
  const theme = roleThemes[actor] ?? roleThemes.citizen
  const RoleIcon = theme.icon

  return (
    <AppLayout actor={actor} page="profile">
      <div className="mx-auto grid w-full max-w-4xl gap-6">
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <DoubleBorderCard>
          <div className="p-6">
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
                  {actor === 'watcher' && (
                    <Badge className="gap-1 border-transparent bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <BadgeCheck className="size-3.5" />
                      Vigie certifiée
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">{email}</p>
              </div>
              <div className={cn('flex items-center gap-2 rounded-xl border p-3', theme.color)}>
                <RoleIcon className="size-5" />
                <span className="text-sm font-medium">{theme.label}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
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
                icon={<Award className="size-4" />}
                label="Score de contribution"
                value={contributionScore != null ? String(contributionScore) : '—'}
                sub="points cumulés"
              />
            </div>
          </div>
        </DoubleBorderCard>

        {/* ── Quick stats ──────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickStat
            icon={CalendarDays}
            label="Membre depuis"
            value="2024"
            color="text-chart-1"
          />
          <QuickStat
            icon={Trophy}
            label="Engagement"
            value={contributionScore != null ? `${contributionScore} pts` : '—'}
            color="text-chart-4"
          />
          <QuickStat
            icon={BadgeCheck}
            label="Statut compte"
            value={statusLabel}
            color={session?.user.actorStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-muted-foreground'}
          />
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4 animate-fade-in motion-reduce:animate-none">
            <DoubleBorderCard>
              <Card className="pt-0">
                <CardHeader className="bg-sidebar/20 p-2.5">
                  <CardTitle>Historique d'activité</CardTitle>
                  <CardDescription>
                    Vos dernières actions et contributions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkTable actor={actor} />
                </CardContent>
              </Card>
            </DoubleBorderCard>
          </TabsContent>

          <TabsContent value="account" className="mt-4 animate-fade-in motion-reduce:animate-none">
            <DoubleBorderCard>
              <Card className="pt-0">
                <CardHeader className="bg-sidebar/20 p-2.5">
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
            </DoubleBorderCard>
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
    <div className="bg-muted/40 rounded-xl border p-4 transition-all hover:border-border/80 hover:shadow-sm">
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
    <div className="rounded-lg border p-3 transition-all hover:border-border/80 hover:shadow-sm">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-border/80 hover:shadow-sm">
      <div className={cn('flex size-10 items-center justify-center rounded-lg border', color)}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
