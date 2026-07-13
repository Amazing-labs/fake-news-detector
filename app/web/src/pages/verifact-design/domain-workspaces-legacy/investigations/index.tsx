import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { FileSearch, RotateCcw } from 'lucide-react'
import {
  getInvestigation,
  getInvestigationEvidence,
  getInvestigationSourceMedia,
  investigationQueryKeys,
} from '@entities/investigation/api'
import { PageLoader } from '@shared/ui/loader'
import { Button } from '@shared/ui/shadcn/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { useResolvedActor } from '../../session-routing'
import { EmptyState, ErrorState } from '../../workspace-ui'
import { DirectorInvestigationWorkspace } from './director-workspace'
import { InvestigationList } from './investigation-list'
import { JournalistInvestigationWorkspace } from './journalist-workspace'
import {
  toDossier,
  toJournalistProof,
  toSourceGroups,
  toWatcherEvidence,
} from './to-dossier'
import { WatcherInvestigationWorkspace } from './watcher-workspace'

export function InvestigationsWorkspacePage({
  defaultTab = 'pending',
}: {
  defaultTab?: 'pending' | 'published' | 'canceled'
}) {
  const { actor, isActorPending } = useResolvedActor('guest')

  if (isActorPending) return null

  return (
    <AppLayout actor={actor} page="investigations">
      <Tabs defaultValue={defaultTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="published">Publiées</TabsTrigger>
            <TabsTrigger value="canceled">Annulées</TabsTrigger>
          </TabsList>
          {actor === 'director' && (
            <Button asChild>
              <Link
                to="/publications/corrections"
                search={{ publicationId: undefined }}
              >
                <RotateCcw className="size-4" />
                Créer un correctif
              </Link>
            </Button>
          )}
        </div>
        <TabsContent value="pending" className="mt-4">
          <InvestigationList status="PENDING_REVIEW" />
        </TabsContent>
        <TabsContent value="published" className="mt-4">
          <InvestigationList status="PUBLISHED" />
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          <InvestigationList status="CANCELED" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

export function InvestigationDetailWorkspacePage({
  investigationId,
}: {
  investigationId?: string
}) {
  const { actor, isActorPending } = useResolvedActor('guest')
  const id = investigationId ?? ''

  const investigationQuery = useQuery({
    queryKey: investigationQueryKeys.detail(id),
    queryFn: () => getInvestigation(id),
    enabled: Boolean(id),
  })
  const sourceMediaQuery = useQuery({
    queryKey: investigationQueryKeys.sourceMedia(id),
    queryFn: () => getInvestigationSourceMedia(id),
    enabled: Boolean(id),
  })
  const evidenceQuery = useQuery({
    queryKey: investigationQueryKeys.evidence(id),
    queryFn: () => getInvestigationEvidence(id),
    enabled: Boolean(id),
  })

  if (isActorPending) return null

  if (!id) {
    return (
      <AppLayout actor={actor} page="investigations">
        <EmptyState
          icon={FileSearch}
          title="Aucun dossier sélectionné"
          description="Choisissez une enquête dans la liste pour ouvrir son dossier."
        />
      </AppLayout>
    )
  }

  const isPending =
    investigationQuery.isPending ||
    sourceMediaQuery.isPending ||
    evidenceQuery.isPending
  const error =
    investigationQuery.error ?? sourceMediaQuery.error ?? evidenceQuery.error

  if (
    isPending ||
    error ||
    !investigationQuery.data ||
    !sourceMediaQuery.data ||
    !evidenceQuery.data
  ) {
    return (
      <AppLayout actor={actor} page="investigations">
        {error ? (
          <ErrorState error={error} />
        ) : (
          <PageLoader label="Chargement du dossier…" />
        )}
      </AppLayout>
    )
  }

  const dossier = toDossier(investigationQuery.data)
  const sourceGroups = toSourceGroups(sourceMediaQuery.data)
  const journalistProofMedia = toJournalistProof(sourceMediaQuery.data)
  const watcherEvidence = toWatcherEvidence(evidenceQuery.data)

  if (actor === 'journalist') {
    return (
      <JournalistInvestigationWorkspace
        dossier={dossier}
        sourceGroups={sourceGroups}
        journalistProofMedia={journalistProofMedia}
        watcherEvidence={watcherEvidence}
      />
    )
  }

  if (actor === 'watcher') {
    return (
      <WatcherInvestigationWorkspace
        dossier={dossier}
        sourceGroups={sourceGroups}
        journalistProofMedia={journalistProofMedia}
        watcherEvidence={watcherEvidence}
      />
    )
  }

  return (
    <DirectorInvestigationWorkspace
      dossier={dossier}
      sourceGroups={sourceGroups}
      journalistProofMedia={journalistProofMedia}
      watcherEvidence={watcherEvidence}
    />
  )
}
