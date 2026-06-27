import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RotateCcw } from 'lucide-react'
import {
  getInvestigation,
  getInvestigationEvidence,
  getInvestigationSourceMedia,
  investigationQueryKeys,
} from '@entities/investigation/api'
import { toApiErrorMessage } from '@shared/api/http'
import { Button } from '@shared/ui/shadcn/button'
import { Card, CardContent } from '@shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { useResolvedActor } from '../../session-routing'
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
        <Card>
          <CardContent className="text-muted-foreground pt-6">
            Aucun dossier sélectionné.
          </CardContent>
        </Card>
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
        <Card>
          <CardContent className={error ? 'text-destructive pt-6' : 'pt-6'}>
            {error ? toApiErrorMessage(error) : 'Chargement du dossier...'}
          </CardContent>
        </Card>
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
