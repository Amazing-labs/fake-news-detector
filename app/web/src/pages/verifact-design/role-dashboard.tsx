import { Link } from '@tanstack/react-router'
import { LogIn, Plus } from 'lucide-react'
import { cn } from '../../shared/lib/utils'
import { Badge } from '../../shared/ui/shadcn/badge'
import { Button } from '../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import { AppLayout } from './app-layout'
import { roleCards } from './data'
import { MetricGrid } from './metric-grid'
import { useResolvedActor } from './session-routing'
import type { Actor } from './types'
import { WorkTable } from './work-table'

export function RoleDashboard({ actor: fallbackActor }: { actor?: Actor }) {
  const { actor, isPending } = useResolvedActor(fallbackActor ?? 'guest')
  const currentRole =
    roleCards.find((role) => role.actor === actor) ?? roleCards[2]
  const Icon = currentRole.icon

  if (isPending) {
    return (
      <AppLayout actor={fallbackActor ?? 'guest'} page="dashboard">
        <Card>
          <CardContent className="text-muted-foreground p-6 text-sm">
            Chargement de la session...
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout actor={actor} page="dashboard">
      <MetricGrid actor={actor} />
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <WorkTable
          action={
            <Button asChild>
              <Link
                to={actor === 'guest' ? '/auth' : '/inbox-subjects/global'}
                search={actor === 'guest' ? { mode: 'sign-in' } : undefined}
              >
                {actor === 'guest' ? <LogIn /> : <Plus />}
                {actor === 'guest' ? 'Entrer' : 'Nouveau dossier'}
              </Link>
            </Button>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-5" />
              Vue rôle
            </CardTitle>
            <CardDescription>{currentRole.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleCards.map((role) => {
              const RoleIcon = role.icon
              return (
                <div
                  key={role.actor}
                  className={cn(
                    'rounded-lg border p-3',
                    role.actor === actor && 'bg-muted',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RoleIcon className="text-muted-foreground size-4" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{role.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {role.metric}
                      </p>
                    </div>
                    {role.actor === actor ? <Badge>Actif</Badge> : null}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
