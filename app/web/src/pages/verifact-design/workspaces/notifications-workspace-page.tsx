import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  CheckCheck,
  ExternalLink,
  Newspaper,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@shared/lib/utils'
import type { NotificationItem } from '@entities/notification/model'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationQueryKeys,
} from '@entities/notification/api'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'

const notificationTypeConfig = {
  PUBLICATION: {
    icon: Newspaper,
    label: 'Publication',
    intent: 'Verdict public disponible',
    actionLabel: 'Ouvrir la publication',
    description:
      'Une enquête a été finalisée et son verdict est désormais public. Vous pouvez consulter les preuves, les sources vérifiées et le verdict officiel.',
    color: 'blue' as const,
  },
  CORRECTION: {
    icon: RotateCcw,
    label: 'Correctif',
    intent: 'Publication corrigée',
    actionLabel: 'Ouvrir le correctif',
    description:
      'Une publication existante a été révisée après une nouvelle validation éditoriale. Un correctif officiel remplace ou complète le contenu initial.',
    color: 'amber' as const,
  },
  ALERT: {
    icon: AlertTriangle,
    label: 'Alerte',
    intent: 'Intervention attendue',
    actionLabel: 'Retour aux notifications',
    description:
      'Une action est requise de votre part : une preuve, une révision ou une décision éditoriale attend votre intervention dans les meilleurs délais.',
    color: 'red' as const,
  },
  ARCHIVED_PUBLICATION: {
    icon: Archive,
    label: 'Archive',
    intent: 'Enquête archivée',
    actionLabel: 'Ouvrir le dossier',
    description:
      "Une enquête a été classée sans suite par la direction éditoriale. Le dossier reste accessible à titre d'archive pour référence future.",
    color: 'zinc' as const,
  },
} as const

const colorMap = {
  blue: {
    icon: 'bg-blue-500/15 text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    border: 'border-blue-500/20',
  },
  amber: {
    icon: 'bg-amber-500/15 text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'border-amber-500/20',
  },
  red: {
    icon: 'bg-red-500/15 text-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    border: 'border-red-500/20',
  },
  zinc: {
    icon: 'bg-zinc-500/15 text-zinc-400',
    badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    border: 'border-zinc-500/20',
  },
}

type NotifItem = NotificationItem

function getNotificationConfig(type: string) {
  return (
    notificationTypeConfig[type as keyof typeof notificationTypeConfig] ??
    notificationTypeConfig.ALERT
  )
}

function getNotificationTarget(item: NotifItem) {
  if (item.publicationId) {
    return {
      kind: 'publication',
      id: item.publicationId,
      label: getNotificationConfig(item.type).actionLabel,
    } as const
  }

  if (item.investigationId) {
    return {
      kind: 'investigation',
      id: item.investigationId,
      label: getNotificationConfig(item.type).actionLabel,
    } as const
  }

  return null
}

function NotificationRow({ item }: { item: NotifItem }) {
  const config = getNotificationConfig(item.type)
  const Icon = config.icon
  const target = getNotificationTarget(item)

  return (
    <Link
      to="/notifications/$notificationId"
      params={{ notificationId: item.id }}
      className="block"
      aria-label={`Voir le détail: ${item.theme}`}
    >
      <div
        className={cn(
          'hover:bg-muted/40 flex items-start gap-4 rounded-xl border p-4 transition-colors',
          !item.isRead && 'border-primary/30 bg-primary/5',
        )}
      >
        <div
          className={cn(
            'bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
            !item.isRead && 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!item.isRead && (
              <span className="bg-primary size-2 shrink-0 rounded-full" />
            )}
            <p className="font-semibold">{item.theme}</p>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{item.message}</p>
          <p className="text-muted-foreground mt-2 text-xs font-medium">
            {config.intent}
          </p>
        </div>
        {target && (
          <ExternalLink className="text-muted-foreground mt-1 size-4 shrink-0" />
        )}
      </div>
    </Link>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Elles apparaîtront ici dès que quelque chose change dans tes dossiers.
      </p>
    </div>
  )
}

export function NotificationsWorkspacePage() {
  const { actor } = useResolvedActor('journalist')
  const queryClient = useQueryClient()
  const notificationsQuery = useQuery({
    queryKey: notificationQueryKeys.list(),
    queryFn: () => listNotifications(),
  })
  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  })

  const items: NotifItem[] = notificationsQuery.data?.items ?? []
  const unread = items.filter((n) => !n.isRead)
  const read = items.filter((n) => n.isRead)

  return (
    <AppLayout actor={actor} page="notifications">
      <div className="grid gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              {unread.length > 0
                ? `${unread.length} non lue${unread.length > 1 ? 's' : ''}`
                : 'Tout est lu'}
            </p>
          </div>
          {unread.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="size-4" />
              Tout lire
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Toutes ({items.length})</TabsTrigger>
            <TabsTrigger value="unread">Non lues ({unread.length})</TabsTrigger>
            <TabsTrigger value="read">Lues ({read.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-2">
              {items.map((item) => (
                <NotificationRow key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            {unread.length > 0 ? (
              <div className="grid gap-2">
                {unread.map((item) => (
                  <NotificationRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState label="Aucune notification non lue" />
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-4">
            {read.length > 0 ? (
              <div className="grid gap-2">
                {read.map((item) => (
                  <NotificationRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState label="Aucune notification lue" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

export function NotificationDetailWorkspacePage({
  notificationId,
}: {
  notificationId: string
}) {
  const { actor } = useResolvedActor('journalist')
  const queryClient = useQueryClient()
  const notificationsQuery = useQuery({
    queryKey: notificationQueryKeys.list(),
    queryFn: () => listNotifications(),
  })
  const item = notificationsQuery.data?.items.find(
    (candidate) => candidate.id === notificationId,
  )

  const markRead = useMutation({
    mutationFn: () => markNotificationRead(notificationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  })
  const shouldMarkRead = Boolean(item && !item.isRead)
  useEffect(() => {
    if (shouldMarkRead) markRead.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldMarkRead, notificationId])

  if (!item) {
    return (
      <AppLayout actor={actor} page="notifications">
        <div className="rounded-xl border p-8 text-center">
          <p className="font-medium">
            {notificationsQuery.isPending
              ? 'Chargement…'
              : 'Notification introuvable'}
          </p>
        </div>
      </AppLayout>
    )
  }
  const config = getNotificationConfig(item.type)
  const target = getNotificationTarget(item)
  const Icon = config.icon
  const colors = colorMap[config.color]

  return (
    <AppLayout actor={actor} page="notifications">
      <div className="grid min-h-[60vh] w-full grid-cols-1 gap-0 overflow-hidden rounded-xl border sm:grid-cols-[220px_1fr]">
        {/* ── Left panel ────────────────────────────────────────────────────── */}
        <div className="bg-muted/40 border-border flex flex-col items-center gap-4 border-b p-8 sm:border-r sm:border-b-0">
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-2xl',
              colors.icon,
            )}
          >
            <Icon className="size-7" />
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium',
              colors.badge,
            )}
          >
            {config.label}
          </span>
          <div className="border-border mt-4 w-full border-t pt-4 text-center">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Motif
            </p>
            <p className="mt-1 text-sm font-semibold">{config.intent}</p>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────────── */}
        <div className="flex flex-col p-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground mb-6 -ml-2 w-fit gap-1.5"
            asChild
          >
            <Link to="/notifications">
              <ArrowLeft className="size-3.5" />
              Notifications
            </Link>
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {item.theme}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-prose text-sm leading-relaxed">
              {item.message}
            </p>
          </div>

          {target && (
            <div className="mt-8 border-t pt-6">
              {target.kind === 'publication' && (
                <Button className="gap-2" asChild>
                  <Link
                    to="/publications/$publicationId"
                    params={{ publicationId: target.id }}
                  >
                    <ExternalLink className="size-4" />
                    {target.label}
                  </Link>
                </Button>
              )}
              {target.kind === 'investigation' && (
                <Button className="gap-2" asChild>
                  <Link
                    to="/investigations/$investigationId"
                    params={{ investigationId: target.id }}
                  >
                    <ExternalLink className="size-4" />
                    {target.label}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
