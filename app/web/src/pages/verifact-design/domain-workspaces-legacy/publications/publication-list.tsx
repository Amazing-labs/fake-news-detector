import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  Megaphone,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Link as LinkIcon,
  Image,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { cn } from '@shared/lib/utils'
import { AppLayout } from '../../app-layout'
import { useResolvedActor } from '../../session-routing'
import { domainLabel } from '../../workspace-labels'
import { DoubleBorderCard, EmptyState, ErrorState, StatCard } from '../../workspace-ui'
import {
  listPublications,
  publicationQueryKeys,
} from '@entities/publication/api'
import type { PublicationItem } from '@entities/publication/model'
import {
  filterPublicationsByVerdict,
  type PublicationVerdictFilter,
} from './publication-filters'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days}j`
  const months = Math.floor(days / 30)
  return `il y a ${months}mois`
}

const verdictColor: Record<string, string> = {
  TRUE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  FALSE: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
  MISLEADING: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  UNVERIFIABLE: 'border-slate-400/40 bg-slate-400/10 text-slate-500 dark:text-slate-400',
}

const verdictBorder: Record<string, string> = {
  TRUE: 'border-l-emerald-500',
  FALSE: 'border-l-red-500',
  MISLEADING: 'border-l-amber-500',
  UNVERIFIABLE: 'border-l-slate-400',
}

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

  const trueCount = items.filter(i => i.finalVerdict === 'TRUE').length
  const falseCount = items.filter(i => i.finalVerdict === 'FALSE').length
  const misleadingCount = items.filter(i => i.finalVerdict === 'MISLEADING').length
  const unverifiableCount = items.filter(i => i.finalVerdict === 'UNVERIFIABLE').length

  return (
    <AppLayout actor={actor} page="publications">
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            title="Vrai"
            value={String(trueCount)}
            hint="publications"
            icon={CheckCircle2}
          />
          <StatCard
            title="Faux"
            value={String(falseCount)}
            hint="publications"
            icon={XCircle}
          />
          <StatCard
            title="Trompeur"
            value={String(misleadingCount)}
            hint="publications"
            icon={AlertTriangle}
          />
          <StatCard
            title="Non vérifiable"
            value={String(unverifiableCount)}
            hint="publications"
            icon={HelpCircle}
          />
        </div>

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
      </div>
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
  const navigate = useNavigate()

  return (
    <DoubleBorderCard>
      <Card className="pt-0">
        <CardHeader className="bg-sidebar/20 p-2.5">
          <CardTitle>Publications et correctifs</CardTitle>
          <CardDescription>
            Chaque publication conserve son verdict final et ses preuves.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {query.isError ? (
            <ErrorState error={query.error} />
          ) : query.isPending ? (
            <div className="grid gap-3">
              <div className="bg-muted h-20 animate-pulse rounded-lg" />
              <div className="bg-muted h-20 animate-pulse rounded-lg" />
              <div className="bg-muted h-20 animate-pulse rounded-lg" />
            </div>
          ) : items.length ? (
            items.map((item) => {
              const publicationId = item.id
              const linkCount = item.verifiedLinks.length
              const mediaCount = item.verifiedMedia.length

              return (
                <Link
                  key={item.id}
                  to="/publications/$publicationId"
                  params={{ publicationId }}
                    className={cn(
                    'hover:border-border hover:bg-muted/30 grid gap-3 rounded-lg border p-4 transition-all sm:grid-cols-[1fr_auto] sm:items-start',
                    'border-l-4 hover:shadow-sm active:scale-[0.99]',
                    verdictBorder[item.finalVerdict] ?? 'border-l-border',
                  )}
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
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border',
                          verdictColor[item.finalVerdict] ?? 'text-muted-foreground border-border',
                        )}
                      >
                        {domainLabel(item.finalVerdict)}
                      </span>
                      <span className="text-muted-foreground/50 text-xs">
                        {relativeTime(item.publishedAt)}
                      </span>
                    </div>
                    <div className="text-muted-foreground/60 mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                      {linkCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <LinkIcon className="size-3" />
                          {linkCount} lien{linkCount > 1 ? 's' : ''}
                        </span>
                      )}
                      {mediaCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Image className="size-3" />
                          {mediaCount} média{mediaCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    {canManage && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate({
                            to: '/publications/corrections',
                            search: { publicationId },
                          })
                        }}
                      >
                        <RotateCcw />
                        Correctif
                      </Button>
                    )}
                  </div>
                </Link>
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
    </DoubleBorderCard>
  )
}
