import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FileSearch } from 'lucide-react'
import { PageLoader } from '@shared/ui/loader'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  investigationQueryKeys,
  listInvestigations,
  type InvestigationScope,
} from '@entities/investigation/api'
import { domainLabel } from '../../workspace-labels'
import { EmptyState, ErrorState, StatusBadge } from '../../workspace-ui'

/**
 * The investigation collection for one lifecycle slice. Omitting `scope` lists
 * every status — which, combined with the server-side ownership scoping, is how
 * a journalist gets the full history of the dossiers they own.
 */
export function InvestigationList({
  scope,
  title = 'Liste des enquêtes',
  description = 'Le détail contient les actions de publication, rejet et archive.',
  emptyDescription = 'Les enquêtes apparaîtront ici quand leur statut changera.',
}: {
  scope?: InvestigationScope
  title?: string
  description?: string
  emptyDescription?: string
}) {
  const investigationsQuery = useQuery({
    queryKey: investigationQueryKeys.list({ scope }),
    queryFn: () => listInvestigations({ scope }),
  })
  const rows = investigationsQuery.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {rows.length > 0 && (
            <span className="text-muted-foreground text-sm font-normal tabular-nums">
              {rows.length}
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.map((item) => (
            <div
              key={item.id}
              className="border-border/60 hover:border-border hover:bg-muted/30 grid gap-4 rounded-lg border p-4 transition-colors lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {item.title ?? 'Sujet sans titre'}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {[
                    item.journalistName ?? 'Non assigné',
                    item.draftVerdict ? domainLabel(item.draftVerdict) : null,
                    item.mediaCategory ? domainLabel(item.mediaCategory) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: item.id }}
                >
                  Voir le détail
                </Link>
              </Button>
            </div>
          ))
        ) : investigationsQuery.isError ? (
          <ErrorState error={investigationsQuery.error} />
        ) : investigationsQuery.isPending ? (
          <PageLoader label="Chargement des enquêtes…" />
        ) : (
          <EmptyState
            icon={FileSearch}
            title="Aucun dossier pour ce filtre"
            description={emptyDescription}
          />
        )}
      </CardContent>
    </Card>
  )
}
