import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  decisionQueryKeys,
  listDirectorDecisions,
  type Decision,
} from '@entities/decision/api'
import { toApiErrorMessage } from '@shared/api/http'
import { cn } from '@shared/lib/utils'
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

const STATUS_STYLE: Record<string, string> = {
  Publiee: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Corrigee: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Revue direction': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Relecture: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'En enquête': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'En cours': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Ouvert: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Archive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        style ?? 'bg-muted text-muted-foreground border-transparent',
      )}
    >
      {status}
    </span>
  )
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
                  <StatusBadge status={item.status} />
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

// Maps a workflow-audit decision (its resulting status) to a display label and
// badge style. Covers the statuses a director's decision can produce.
const DECISION_META: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: 'Publiée',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  NEEDS_REVISION: {
    label: 'Renvoyée en correction',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  ARCHIVED: {
    label: 'Archivée',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
  CANCELED: {
    label: 'Annulée',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  PENDING_REVIEW: {
    label: 'Soumise en revue',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
}

function DecisionBadge({ status }: { status: string }) {
  const meta = DECISION_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        meta?.className ?? 'bg-muted text-muted-foreground border-transparent',
      )}
    >
      {meta?.label ?? status}
    </span>
  )
}

function formatDecisionDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
}

// Director-only: the real history of past editorial decisions, backed by
// GET /api/director/decisions (workflow audit trail).
function DirectorDecisionsCard(props: {
  title: string
  description: string
  action?: ReactNode
}) {
  const query = useQuery({
    queryKey: decisionQueryKeys.list(),
    queryFn: () => listDirectorDecisions(),
  })
  const decisions: Decision[] = query.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
        {props.action ? <CardAction>{props.action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <p className="text-muted-foreground text-sm">Chargement…</p>
        ) : query.isError ? (
          <p className="text-sm text-red-400">
            {toApiErrorMessage(query.error)}
          </p>
        ) : decisions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune décision pour l&apos;instant.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dossier</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Décision</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell className="font-medium">
                    {decision.title ?? 'Enquête'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {decision.comment ?? '—'}
                  </TableCell>
                  <TableCell>
                    <DecisionBadge status={decision.newStatus} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDecisionDate(decision.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground size-8 rounded-full"
                      asChild
                      aria-label={`Voir ${decision.title ?? 'l’enquête'}`}
                    >
                      <Link
                        to="/investigations/$investigationId"
                        params={{ investigationId: decision.investigationId }}
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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

  if (actor === 'director') {
    return (
      <DirectorDecisionsCard
        title={props.title ?? 'Historique des décisions'}
        description={
          props.description ??
          'Publications, corrections, archivages et annulations arbitrés par la direction.'
        }
        action={props.action}
      />
    )
  }

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

  const historyKey = actor === 'journalist' ? 'journalist' : 'citizen'

  return (
    <HistoryCard
      title={props.title ?? copy.title}
      description={props.description ?? copy.description}
      items={histories[historyKey]}
      action={props.action}
    />
  )
}
