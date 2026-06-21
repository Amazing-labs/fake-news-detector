import { Link } from '@tanstack/react-router'
import { RotateCcw } from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
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
  mockDossier,
  mockJournalistProofMedia,
  mockSourceMedia,
  mockWatcherEvidence,
} from './mock-data'
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

  if (isActorPending) return null

  const dossier = { ...mockDossier, id: investigationId ?? mockDossier.id }

  if (actor === 'journalist') {
    return (
      <JournalistInvestigationWorkspace
        dossier={dossier}
        sourceMedia={mockSourceMedia}
        journalistProofMedia={mockJournalistProofMedia}
        watcherEvidence={mockWatcherEvidence}
      />
    )
  }

  if (actor === 'watcher') {
    return (
      <WatcherInvestigationWorkspace
        dossier={dossier}
        watcherEvidence={mockWatcherEvidence}
      />
    )
  }

  return (
    <DirectorInvestigationWorkspace
      dossier={dossier}
      sourceMedia={mockSourceMedia}
      journalistProofMedia={mockJournalistProofMedia}
      watcherEvidence={mockWatcherEvidence}
    />
  )
}
