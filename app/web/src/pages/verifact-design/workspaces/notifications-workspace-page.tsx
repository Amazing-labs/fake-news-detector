import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Archive,
  CheckCheck,
  ExternalLink,
  Newspaper,
  RotateCcw,
} from 'lucide-react'
import { cn } from '../../../shared/lib/utils'
import { useNotificationReadStore } from '../../../entities/notification/model'
import { Badge } from '../../../shared/ui/shadcn/badge'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/ui/shadcn/tabs'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { notificationItems } from '../workspace-mocks'

const notificationTypeConfig = {
  PUBLICATION: {
    icon: Newspaper,
    label: 'Publication',
    intent: 'Verdict public disponible',
    actionLabel: 'Ouvrir la publication',
  },
  CORRECTION: {
    icon: RotateCcw,
    label: 'Correctif',
    intent: 'Publication corrigée',
    actionLabel: 'Ouvrir le correctif',
  },
  ALERT: {
    icon: AlertTriangle,
    label: 'Alerte',
    intent: 'Intervention attendue',
    actionLabel: 'Retour aux notifications',
  },
  ARCHIVED_PUBLICATION: {
    icon: Archive,
    label: 'Archive',
    intent: 'Enquête archivée',
    actionLabel: 'Ouvrir le dossier',
  },
} as const

function getNotificationConfig(
  type: (typeof notificationItems)[number]['type'],
) {
  return notificationTypeConfig[type]
}

function getNotificationTarget(item: (typeof notificationItems)[number]) {
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

type NotifItem = Omit<(typeof notificationItems)[number], 'isRead'> & {
  isRead: boolean
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
  const { readIds, markAllRead } = useNotificationReadStore()

  const items: NotifItem[] = notificationItems.map((n) => ({
    ...n,
    isRead: readIds.has(n.id),
  }))

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
            <Button variant="outline" size="sm" onClick={markAllRead}>
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
  const item =
    notificationItems.find((candidate) => candidate.id === notificationId) ??
    notificationItems[0]
  const config = getNotificationConfig(item.type)
  const target = getNotificationTarget(item)
  const Icon = config.icon

  return (
    <AppLayout actor={actor} page="notifications">
      <Card className={cn(!item.isRead && 'border-primary/30 bg-primary/5')}>
        <CardHeader>
          <div className="flex flex-wrap items-start gap-4">
            <div
              className={cn(
                'bg-muted flex size-11 shrink-0 items-center justify-center rounded-full',
                !item.isRead && 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!item.isRead && (
                  <span className="bg-primary size-2 rounded-full" />
                )}
                <CardTitle>{item.theme}</CardTitle>
                <Badge variant="secondary">{config.label}</Badge>
              </div>
              <CardDescription className="mt-2">{item.message}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {target?.kind === 'publication' && (
              <Button asChild>
                <Link
                  to="/publications/$publicationId"
                  params={{ publicationId: target.id }}
                >
                  <ExternalLink />
                  {target.label}
                </Link>
              </Button>
            )}
            {target?.kind === 'investigation' && (
              <Button asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: target.id }}
                >
                  <ExternalLink />
                  {target.label}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/notifications">← Retour</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
