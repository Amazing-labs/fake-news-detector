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
  defaultTab,
}: {
  defaultTab?: 'all' | 'pending' | 'published' | 'canceled'
}) {
  const { actor, isActorPending } = useResolvedActor('guest')

  if (isActorPending) return null

  // Watchers — and citizens, who share the CITIZEN role — only ever receive
  // dossiers the direction sent back for revision, so a status filter would be
  // a row of tabs all resolving to the same list. Show that list directly.
  if (actor === 'watcher' || actor === 'citizen') {
    return (
      <AppLayout actor={actor} page="investigations">
        <InvestigationList
          scope="contributable"
          title="Enquêtes à enrichir"
          description="Les dossiers renvoyés en correction par la direction, ouverts à vos preuves."
          emptyDescription="Aucun dossier n'attend de contribution pour le moment."
        />
      </AppLayout>
    )
  }

  // A journalist reads their own dossiers whatever the status, so the full list
  // is their natural landing tab; arbitration roles land on the review queue.
  const activeTab = defaultTab ?? (actor === 'journalist' ? 'all' : 'pending')
  const isOwnerView = actor === 'journalist'
  const allTabCopy = isOwnerView
    ? {
        title: 'Mes enquêtes',
        description:
          'Tous les dossiers dont vous êtes propriétaire, quel que soit leur statut.',
        emptyDescription:
          "Prenez un sujet dans l'inbox pour ouvrir votre premier dossier.",
      }
    : {
        title: 'Toutes les enquêtes',
        description: 'Tous les dossiers du desk, quel que soit leur statut.',
        emptyDescription: 'Les enquêtes apparaîtront ici dès leur ouverture.',
      }

  return (
    <AppLayout actor={actor} page="investigations">
      <Tabs defaultValue={activeTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">
              {isOwnerView ? 'Mes enquêtes' : 'Toutes'}
            </TabsTrigger>
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
        <TabsContent value="all" className="mt-4">
          <InvestigationList {...allTabCopy} />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <InvestigationList scope="pending-review" />
        </TabsContent>
        <TabsContent value="published" className="mt-4">
          <InvestigationList scope="published" />
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          <InvestigationList scope="canceled" />
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
  const sourceGroups = toSourceGroups(sourceMediaQuery.data.items)
  const journalistProofMedia = toJournalistProof(sourceMediaQuery.data.items)
  const watcherEvidence = toWatcherEvidence(evidenceQuery.data.items)

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

  if (actor === 'director') {
    return (
      <DirectorInvestigationWorkspace
        dossier={dossier}
        sourceGroups={sourceGroups}
        journalistProofMedia={journalistProofMedia}
        watcherEvidence={watcherEvidence}
      />
    )
  }

  // Fail safe: the arbitration console is opt-in for the director alone. Every
  // other reader — watcher, citizen, or a role added later — gets the read-only
  // dossier, and only a watcher is offered the contribution action.
  return (
    <WatcherInvestigationWorkspace
      dossier={dossier}
      sourceGroups={sourceGroups}
      journalistProofMedia={journalistProofMedia}
      watcherEvidence={watcherEvidence}
      canContribute={actor === 'watcher'}
    />
  )
}
