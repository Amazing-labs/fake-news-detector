import { Link, useLocation } from '@tanstack/react-router'
import { ExternalLink, Megaphone, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@shared/lib/utils'
import { LoadingRow } from '@shared/ui/loader'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
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
import { AppLayout } from '../../app-layout'
import { useResolvedActor } from '../../session-routing'
import { domainLabel } from '../../workspace-labels'
import { EmptyState, ErrorState } from '../../workspace-ui'
import {
  listPublications,
  publicationQueryKeys,
} from '@entities/publication/api'
import type { PublicationItem } from '@entities/publication/model'
import {
  filterPublicationsByVerdict,
  getPublicationVerdictCounts,
  publicationVerdictFilters,
  type PublicationVerdictFilter,
} from './publication-filters'

export function PublicationsWorkspacePage() {
  const { actor } = useResolvedActor('director')
  const canManage = actor === 'director' || actor === 'admin'
  const location = useLocation()
  const [activeSection, setActiveSection] = useState<
    'all' | 'publications' | 'corrections'
  >('all')

  const publicationsQuery = useQuery({
    queryKey: publicationQueryKeys.list(),
    queryFn: () => listPublications(),
  })
  const items = publicationsQuery.data?.items ?? []
  const mainItems = items.filter((item) => !item.isCorrection)
  const correctionItems = items.filter((item) => item.isCorrection)
  const selectedVerdict = useMemo<PublicationVerdictFilter>(() => {
    const search = location.search as
      | Record<string, string | undefined>
      | undefined
    const verdictValue = search?.verdict

    return verdictValue && verdictValue !== 'all'
      ? (verdictValue as PublicationVerdictFilter)
      : 'all'
  }, [location.search])

  const sectionItems =
    activeSection === 'publications'
      ? mainItems
      : activeSection === 'corrections'
        ? correctionItems
        : items

  const visibleItems = filterPublicationsByVerdict(
    sectionItems,
    selectedVerdict,
  )
  const verdictCounts = getPublicationVerdictCounts(sectionItems)

  return (
    <AppLayout actor={actor} page="publications">
      <Tabs
        value={activeSection}
        onValueChange={(value) =>
          setActiveSection(value as 'all' | 'publications' | 'corrections')
        }
      >
        <TabsList className="tabular-nums">
          <TabsTrigger value="all">Toutes ({items.length})</TabsTrigger>
          <TabsTrigger value="publications">
            Publications ({mainItems.length})
          </TabsTrigger>
          <TabsTrigger value="corrections">
            Correctifs ({correctionItems.length})
          </TabsTrigger>
        </TabsList>
        <div className="mt-4 flex flex-wrap gap-2">
          {publicationVerdictFilters.map((filter) => {
            const count = verdictCounts[filter.value]
            const isActive = filter.value === selectedVerdict

            return (
              <Button
                key={filter.value}
                asChild
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={cn('h-8 rounded-full', isActive && 'shadow-sm')}
              >
                <Link
                  to="/publications/list"
                  search={
                    filter.value === 'all'
                      ? undefined
                      : { verdict: filter.value }
                  }
                >
                  {filter.label} ({count})
                </Link>
              </Button>
            )
          })}
        </div>
        <TabsContent value="all" className="mt-4">
          <PublicationList
            items={visibleItems}
            canManage={canManage}
            query={publicationsQuery}
          />
        </TabsContent>
        <TabsContent value="publications" className="mt-4">
          <PublicationList
            items={visibleItems}
            canManage={canManage}
            query={publicationsQuery}
          />
        </TabsContent>
        <TabsContent value="corrections" className="mt-4">
          <PublicationList
            items={visibleItems}
            canManage={canManage}
            query={publicationsQuery}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function PublicationList({
  items,
  canManage,
  query,
}: {
  items: PublicationItem[]
  canManage: boolean
  query: { isPending: boolean; isError: boolean; error: unknown }
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publications et correctifs</CardTitle>
        <CardDescription>
          Chaque publication conserve son verdict final et ses preuves.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {query.isError ? (
          <ErrorState error={query.error} />
        ) : query.isPending ? (
          <LoadingRow label="Chargement des publications…" />
        ) : items.length ? (
          items.map((item) => {
            const publicationId = item.id
            return (
              <div
                key={item.id}
                className="border-border/60 hover:border-border hover:bg-muted/30 grid gap-3 rounded-lg border p-4 transition-colors sm:grid-cols-[1fr_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {item.title ?? 'Publication sans titre'}
                    </p>
                    <Badge
                      variant={item.isCorrection ? 'secondary' : 'outline'}
                    >
                      {item.isCorrection ? 'Correctif' : 'Publication'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Verdict : {domainLabel(item.finalVerdict)}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  {canManage && (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        to="/publications/corrections"
                        search={{ publicationId }}
                      >
                        <RotateCcw />
                        Correctif
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    asChild
                  >
                    <Link
                      to="/publications/$publicationId"
                      params={{ publicationId }}
                      aria-label={`Voir le détail de ${item.title ?? publicationId}`}
                    >
                      <ExternalLink />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <EmptyState
            icon={Megaphone}
            title="Aucune publication ici"
            description="Les publications apparaîtront ici une fois validées."
          />
        )}
      </CardContent>
    </Card>
  )
}
