import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  contributionQueryKeys,
  listMyContributions,
} from '@entities/contribution/api'
import {
  decisionQueryKeys,
  listDirectorDecisions,
} from '@entities/decision/api'
import {
  investigationQueryKeys,
  listInvestigations,
} from '@entities/investigation/api'
import { listReports, reportQueryKeys } from '@entities/report/api'
import { useAppSession } from '@entities/session/model'
import { LoadingRow } from '@shared/ui/loader'
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
import { ErrorState, StatusBadge } from './workspace-ui'

// A normalized, display-ready history row. `link` is a discriminated union so
// the TanStack Router <Link> stays type-safe across the report/investigation
// detail routes.
type HistoryLink =
  | { to: '/reports/$reportId'; params: { reportId: string } }
  | {
      to: '/investigations/$investigationId'
      params: { investigationId: string }
    }

type HistoryRow = {
  id: string
  title: string
  context: string
  status: string
  date: string
  link: HistoryLink
}

function formatHistoryDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
}

function DetailLink({ link, label }: { link: HistoryLink; label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground size-8 rounded-full"
      asChild
      aria-label={label}
    >
      {link.to === '/reports/$reportId' ? (
        <Link to={link.to} params={link.params}>
          <ExternalLink className="size-4" />
        </Link>
      ) : (
        <Link to={link.to} params={link.params}>
          <ExternalLink className="size-4" />
        </Link>
      )}
    </Button>
  )
}

// Shared history card: handles loading / error / empty and renders the rows.
function HistoryTableCard(props: {
  title: string
  description: string
  contextLabel: string
  isPending: boolean
  isError: boolean
  error: unknown
  rows: HistoryRow[]
  emptyLabel: string
  action?: ReactNode
}) {
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
              <TableHead>{props.contextLabel}</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.isPending ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <LoadingRow />
                </TableCell>
              </TableRow>
            ) : props.isError ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <ErrorState
                    error={props.error}
                    className="border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : props.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>{props.emptyLabel}</TableCell>
              </TableRow>
            ) : null}
            {props.rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell
                  className="max-w-[16rem] truncate font-medium"
                  title={row.title}
                >
                  {row.title}
                </TableCell>
                <TableCell
                  className="text-muted-foreground max-w-xs truncate"
                  title={row.context}
                >
                  {row.context}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.date}
                </TableCell>
                <TableCell className="text-right">
                  <DetailLink link={row.link} label={`Voir ${row.title}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ── Director: past editorial decisions (workflow audit) ─────────────────────────
function DirectorHistory(props: {
  title: string
  description: string
  action?: ReactNode
}) {
  const query = useQuery({
    queryKey: decisionQueryKeys.list(),
    queryFn: () => listDirectorDecisions(),
  })
  const rows: HistoryRow[] = (query.data?.items ?? []).map((decision) => ({
    id: decision.id,
    title: decision.title ?? 'Enquête',
    context: decision.comment ?? '—',
    status: decision.newStatus,
    date: formatHistoryDate(decision.createdAt),
    link: {
      to: '/investigations/$investigationId',
      params: { investigationId: decision.investigationId },
    },
  }))

  return (
    <HistoryTableCard
      title={props.title}
      description={props.description}
      contextLabel="Motif"
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      rows={rows}
      emptyLabel="Aucune décision pour l'instant"
      action={props.action}
    />
  )
}

// ── Journalist: own investigations ──────────────────────────────────────────────
function JournalistHistory(props: {
  title: string
  description: string
  action?: ReactNode
}) {
  const { session } = useAppSession()
  const journalistId = session?.user.actorId ?? undefined
  const query = useQuery({
    queryKey: investigationQueryKeys.list({ journalistId }),
    queryFn: () => listInvestigations({ journalistId }),
    enabled: Boolean(journalistId),
  })
  const rows: HistoryRow[] = (query.data?.items ?? []).map((investigation) => ({
    id: investigation.id,
    title: investigation.title ?? 'Enquête',
    context: investigation.subject ?? '—',
    status: investigation.status,
    date: formatHistoryDate(investigation.updatedAt),
    link: {
      to: '/investigations/$investigationId',
      params: { investigationId: investigation.id },
    },
  }))

  return (
    <HistoryTableCard
      title={props.title}
      description={props.description}
      contextLabel="Sujet"
      isPending={query.isPending || !journalistId}
      isError={query.isError}
      error={query.error}
      rows={rows}
      emptyLabel="Aucune enquête pour l'instant"
      action={props.action}
    />
  )
}

// ── Citizen / watcher: own reports ──────────────────────────────────────────────
function ReportsHistory(props: {
  title: string
  description: string
  emptyLabel: string
}) {
  const query = useQuery({
    queryKey: reportQueryKeys.list(),
    queryFn: () => listReports(),
  })
  const rows: HistoryRow[] = (query.data?.items ?? []).map((report) => ({
    id: report.id,
    title: report.title || report.theme,
    context: report.theme,
    status: report.status,
    date: formatHistoryDate(report.createdAt),
    link: { to: '/reports/$reportId', params: { reportId: report.id } },
  }))

  return (
    <HistoryTableCard
      title={props.title}
      description={props.description}
      contextLabel="Thème"
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      rows={rows}
      emptyLabel={props.emptyLabel}
    />
  )
}

// ── Watcher: own contributions (evidence) ───────────────────────────────────────
function ContributionsHistory(props: { title: string; description: string }) {
  const query = useQuery({
    queryKey: contributionQueryKeys.mine(),
    queryFn: () => listMyContributions(),
  })
  const rows: HistoryRow[] = (query.data?.items ?? []).map((contribution) => ({
    id: contribution.id,
    title: contribution.title,
    context: contribution.investigationTitle ?? 'Contribution',
    status: contribution.investigationStatus ?? '—',
    date: formatHistoryDate(contribution.createdAt),
    link: {
      to: '/investigations/$investigationId',
      params: { investigationId: contribution.investigationId },
    },
  }))

  return (
    <HistoryTableCard
      title={props.title}
      description={props.description}
      contextLabel="Enquête"
      isPending={query.isPending}
      isError={query.isError}
      error={query.error}
      rows={rows}
      emptyLabel="Aucune contribution pour l'instant"
    />
  )
}

// Per-role history view. Each role only ever sees its own data — the backend
// scopes every read to the authenticated actor.
export function WorkTable(props: {
  actor?: Actor
  title?: string
  description?: string
  action?: ReactNode
}) {
  const actor = props.actor ?? 'journalist'

  if (actor === 'director') {
    return (
      <DirectorHistory
        title={props.title ?? 'Historique des décisions'}
        description={
          props.description ??
          'Publications, corrections, archivages et annulations arbitrés par la direction.'
        }
        action={props.action}
      />
    )
  }

  if (actor === 'journalist') {
    return (
      <JournalistHistory
        title={props.title ?? 'Historique des enquêtes'}
        description={
          props.description ??
          'Dossiers traités, renvoyés en correction ou soumis en revue.'
        }
        action={props.action}
      />
    )
  }

  if (actor === 'watcher') {
    return (
      <div className="grid gap-6">
        <ContributionsHistory
          title="Historique des contributions"
          description="Contributions vigies rattachées aux enquêtes."
        />
        <ReportsHistory
          title="Historique des signalements"
          description="Signalements envoyés avant ou pendant le rôle vigie."
          emptyLabel="Aucun signalement pour l'instant"
        />
      </div>
    )
  }

  return (
    <ReportsHistory
      title={props.title ?? 'Historique des signalements'}
      description={
        props.description ??
        'Signalements envoyés au desk et suivi éditorial associé.'
      }
      emptyLabel="Aucun signalement pour l'instant"
    />
  )
}
