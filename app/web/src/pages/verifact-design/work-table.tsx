import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/shadcn/table'
import type { Actor } from './types'

type HistoryItemBase = {
  title: string
  context: string
  status: string
  date: string
}

type HistoryItem =
  | (HistoryItemBase & {
      to: '/publications/$publicationId'
      params: { publicationId: string }
    })
  | (HistoryItemBase & {
      to: '/investigations/$investigationId'
      params: { investigationId: string }
    })
  | (HistoryItemBase & {
      to: '/reports/$reportId'
      params: { reportId: string }
    })

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const histories: Record<
  Exclude<Actor, 'guest' | 'admin'> | 'watcherReports',
  HistoryItem[]
> = {
  citizen: [
    {
      title: "Crise d'essence",
      context: 'Signalement citoyen',
      status: 'Ouvert',
      date: '16 mai 2026',
      to: '/reports/$reportId',
      params: { reportId: slugifyLabel("Crise d'essence") },
    },
    {
      title: 'Prix du mil',
      context: 'Signalement citoyen',
      status: 'Ouvert',
      date: '15 mai 2026',
      to: '/reports/$reportId',
      params: { reportId: slugifyLabel('Prix du mil') },
    },
    {
      title: 'Alerte archivée',
      context: 'Signalement citoyen',
      status: 'Archive',
      date: '12 mai 2026',
      to: '/reports/$reportId',
      params: { reportId: slugifyLabel('Alerte archivée') },
    },
  ],
  watcherReports: [
    {
      title: "Crise d'essence",
      context: 'Signalement citoyen',
      status: 'Ouvert',
      date: '16 mai 2026',
      to: '/reports/$reportId',
      params: { reportId: slugifyLabel("Crise d'essence") },
    },
  ],
  watcher: [
    {
      title: 'Video de checkpoint',
      context: 'Contribution média et contexte',
      status: 'En enquête',
      date: '17 mai 2026',
      to: '/investigations/$investigationId',
      params: { investigationId: slugifyLabel('Video de checkpoint') },
    },
    {
      title: "Crise d'essence",
      context: 'Observation terrain',
      status: 'En cours',
      date: '16 mai 2026',
      to: '/investigations/$investigationId',
      params: { investigationId: slugifyLabel("Crise d'essence") },
    },
  ],
  journalist: [
    {
      title: 'Video de checkpoint',
      context: 'Enquête documentée',
      status: 'Revue direction',
      date: '17 mai 2026',
      to: '/investigations/$investigationId',
      params: { investigationId: slugifyLabel('Video de checkpoint') },
    },
    {
      title: 'Prix du mil',
      context: 'Enquête à corriger',
      status: 'Relecture',
      date: '14 mai 2026',
      to: '/investigations/$investigationId',
      params: { investigationId: slugifyLabel('Prix du mil') },
    },
  ],
  director: [
    {
      title: 'La video du checkpoint date de 2022',
      context: 'Publication finale',
      status: 'Publiee',
      date: '18 mai 2026',
      to: '/publications/$publicationId',
      params: {
        publicationId: slugifyLabel('La video du checkpoint date de 2022'),
      },
    },
    {
      title: 'Correction sur le prix du mil',
      context: 'Correctif publié',
      status: 'Corrigee',
      date: '16 mai 2026',
      to: '/publications/$publicationId',
      params: { publicationId: slugifyLabel('Correction sur le prix du mil') },
    },
  ],
}

function historyCopy(actor: Actor) {
  if (actor === 'director') {
    return {
      title: 'Historique des publications',
      description:
        'Publications, correctifs et archives arbitres par la direction.',
    }
  }

  if (actor === 'journalist') {
    return {
      title: 'Historique des enquetes',
      description: 'Dossiers traites, renvoyes en correction ou soumis.',
    }
  }

  if (actor === 'watcher') {
    return {
      title: 'Historique des contributions',
      description: 'Contributions vigies rattachees aux enquetes en cours.',
    }
  }

  return {
    title: 'Historique des signalements',
    description: 'Signalements envoyés au desk et suivi éditorial associé.',
  }
}

function HistoryCard(props: {
  title: string
  description: string
  items: HistoryItem[]
  action?: ReactNode
}) {
  function renderDetailsLink(item: HistoryItem) {
    switch (item.to) {
      case '/publications/$publicationId':
        return (
          <Link to={item.to} params={item.params}>
            <ExternalLink className="size-4" />
          </Link>
        )
      case '/investigations/$investigationId':
        return (
          <Link to={item.to} params={item.params}>
            <ExternalLink className="size-4" />
          </Link>
        )
      case '/reports/$reportId':
        return (
          <Link to={item.to} params={item.params}>
            <ExternalLink className="size-4" />
          </Link>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
        {props.action ? <CardAction>{props.action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dossier</TableHead>
              <TableHead>Contexte</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.items.map((item) => (
              <TableRow key={`${item.title}-${item.context}`}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.context}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.date}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-8 rounded-full"
                    asChild
                    aria-label={`Voir ${item.title}`}
                  >
                    {renderDetailsLink(item)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function WorkTable(props: {
  actor?: Actor
  title?: string
  description?: string
  action?: ReactNode
}) {
  const actor = props.actor ?? 'journalist'
  const copy = historyCopy(actor)

  if (actor === 'watcher') {
    return (
      <div className="grid gap-6">
        <HistoryCard
          title="Historique des signalements"
          description="Signalements envoyés avant ou pendant le rôle vigie."
          items={histories.watcherReports}
        />
        <HistoryCard
          title={props.title ?? copy.title}
          description={props.description ?? copy.description}
          items={histories.watcher}
          action={props.action}
        />
      </div>
    )
  }

  const historyKey =
    actor === 'director' || actor === 'journalist' ? actor : 'citizen'

  return (
    <HistoryCard
      title={props.title ?? copy.title}
      description={props.description ?? copy.description}
      items={histories[historyKey]}
      action={props.action}
    />
  )
}
