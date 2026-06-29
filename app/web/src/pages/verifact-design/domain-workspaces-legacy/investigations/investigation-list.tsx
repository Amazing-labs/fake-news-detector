import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
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
import { toApiErrorMessage } from '@shared/api/http'
import { StatusBadge } from '../../workspace-ui'

const STATUS_TO_SCOPE: Record<string, InvestigationScope> = {
  PENDING_REVIEW: 'pending-review',
  PUBLISHED: 'published',
  CANCELED: 'canceled',
  IN_PROGRESS: 'in-progress',
}

export function InvestigationList({ status }: { status: string }) {
  const scope = STATUS_TO_SCOPE[status]
  const investigationsQuery = useQuery({
    queryKey: investigationQueryKeys.list({ scope }),
    queryFn: () => listInvestigations({ scope }),
    enabled: !!scope,
  })
  const rows = investigationsQuery.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des enquêtes</CardTitle>
        <CardDescription>
          Le détail contient les actions de publication, rejet et archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {item.title ?? 'Sujet sans titre'}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.journalistName ?? 'Non assigné'}
                  {item.mediaCategory ? ` · ${item.mediaCategory}` : ''}
                  {item.draftVerdict ? ` · ${item.draftVerdict}` : ''}
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
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-destructive font-medium">
              {toApiErrorMessage(investigationsQuery.error)}
            </p>
          </div>
        ) : investigationsQuery.isPending ? (
          <PageLoader label="Chargement des enquêtes…" />
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucun dossier pour ce filtre</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les enquêtes apparaîtront ici quand leur statut changera.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
