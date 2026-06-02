import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Archive,
  ExternalLink,
  Newspaper,
  RotateCcw,
} from 'lucide-react'
import { cn } from '../../../shared/lib/utils'
import { Badge } from '../../../shared/ui/shadcn/badge'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/shadcn/card'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'

const notificationItems = [
  {
    id: 'publication-disponible',
    type: 'PUBLICATION',
    theme: 'Publication disponible',
    message: 'Le dossier checkpoint est maintenant publie avec son verdict.',
    isRead: false,
    publicationId: 'la-video-du-checkpoint-date-de-2022',
    investigationId: null,
  },
  {
    id: 'correctif-publie',
    type: 'CORRECTION',
    theme: 'Correctif publié',
    message: 'Une publication a été corrigée après nouvelle validation.',
    isRead: false,
    publicationId: 'correction-sur-le-prix-du-mil',
    investigationId: null,
  },
  {
    id: 'dossier-archive',
    type: 'ARCHIVED_PUBLICATION',
    theme: 'Dossier archivé',
    message: 'Une enquête non vérifiable a été archivée par la direction.',
    isRead: true,
    publicationId: null,
    investigationId: 'crise-essence',
  },
  {
    id: 'action-requise',
    type: 'ALERT',
    theme: 'Action requise',
    message: 'Une preuve ou une révision attend ton intervention.',
    isRead: true,
    publicationId: null,
    investigationId: null,
  },
] as const

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

export function NotificationsWorkspacePage() {
  const { actor } = useResolvedActor('journalist')

  function renderNotificationCard(item: (typeof notificationItems)[number]) {
    const config = getNotificationConfig(item.type)
    const Icon = config.icon
    const target = getNotificationTarget(item)
    const card = (
      <Card
        className={cn(
          'hover:border-primary/40 hover:bg-muted/40 transition-colors',
          !item.isRead && 'border-primary/30 bg-primary/5 shadow-primary/10',
        )}
      >
        <CardContent className="flex items-start gap-4 p-5">
          <div
            className={cn(
              'bg-muted flex size-10 shrink-0 items-center justify-center rounded-full',
              !item.isRead && 'bg-primary/10 text-primary',
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {!item.isRead ? (
                <span className="bg-primary size-2 rounded-full" />
              ) : null}
              <p className="font-semibold">{item.theme}</p>
              <Badge variant="secondary">{config.label}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{item.message}</p>
            <p className="text-muted-foreground mt-3 text-xs font-medium">
              {config.intent}
            </p>
          </div>
          {target ? (
            <ExternalLink className="text-muted-foreground mt-1 size-4 shrink-0" />
          ) : null}
        </CardContent>
      </Card>
    )

    return (
      <Link
        key={item.id}
        to="/notifications/$notificationId"
        params={{ notificationId: item.id }}
        className="block"
        aria-label={`Voir le détail: ${item.theme}`}
      >
        {card}
      </Link>
    )
  }

  return (
    <AppLayout actor={actor} page="notifications">
      <div className="grid gap-4">
        {notificationItems.map(renderNotificationCard)}
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
      <Card
        className={cn(
          !item.isRead && 'border-primary/30 bg-primary/5 shadow-primary/10',
        )}
      >
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
                {!item.isRead ? (
                  <span className="bg-primary size-2 rounded-full" />
                ) : null}
                <CardTitle>{item.theme}</CardTitle>
                <Badge variant="secondary">{config.label}</Badge>
              </div>
              <CardDescription className="mt-2">{item.message}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {target?.kind === 'publication' ? (
              <Button asChild>
                <Link
                  to="/publications/$publicationId"
                  params={{ publicationId: target.id }}
                >
                  <ExternalLink />
                  {target.label}
                </Link>
              </Button>
            ) : null}
            {target?.kind === 'investigation' ? (
              <Button asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: target.id }}
                >
                  <ExternalLink />
                  {target.label}
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link to="/notifications">Retour aux notifications</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
