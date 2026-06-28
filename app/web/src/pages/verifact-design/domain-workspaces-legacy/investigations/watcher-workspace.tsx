import { FilePlus2 } from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import { Card, CardContent, CardHeader } from '@shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { domainLabel } from '../../workspace-labels'
import { WatcherContributeDialog } from '../shared'
import {
  JournalistProofList,
  SourceMediaReadRow,
  WatcherEvidenceCard,
} from './media-cards'
import { DossierHeader, MetaCell, NotesBlock, OriginBadge } from './primitives'
import type {
  Dossier,
  JournalistProofMedia,
  SourceGroup,
  WatcherEvidenceItem,
} from './types'

export function WatcherInvestigationWorkspace({
  dossier,
  sourceGroups,
  journalistProofMedia,
  watcherEvidence,
}: {
  dossier: Dossier
  sourceGroups: SourceGroup[]
  journalistProofMedia: JournalistProofMedia[]
  watcherEvidence: WatcherEvidenceItem[]
}) {
  return (
    <AppLayout actor="watcher" page="investigations">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <DossierHeader
              dossier={dossier}
              action={
                <WatcherContributeDialog>
                  <Button size="sm">
                    <FilePlus2 className="size-4" />
                    Contribuer
                  </Button>
                </WatcherContributeDialog>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetaCell
                label="Catégorie"
                value={dossier.category ? domainLabel(dossier.category) : '—'}
              />
              <MetaCell label="Journaliste" value={dossier.journalist ?? '—'} />
              <MetaCell
                label="Révision"
                value={`Tentative ${dossier.attempts}`}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="source">
          <div className="overflow-x-auto pb-px">
            <TabsList>
              <TabsTrigger value="source">
                Source ({sourceGroups.flatMap((g) => g.media).length})
              </TabsTrigger>
              <TabsTrigger value="proof">
                Preuves journaliste ({journalistProofMedia.length})
              </TabsTrigger>
              <TabsTrigger value="contributions">
                Contributions ({watcherEvidence.length})
              </TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>

          {/* SOURCE — read-only, watcher can view/download to understand context */}
          <TabsContent value="source" className="mt-4">
            <div className="grid gap-6">
              {sourceGroups
                .filter((g) => g.media.length > 0)
                .map((group) => (
                  <div key={group.origin} className="grid gap-3">
                    <div className="flex items-center gap-2">
                      <OriginBadge origin={group.origin} />
                      <span className="text-muted-foreground text-sm">
                        {group.media.length} média
                        {group.media.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    {group.media.map((media) => (
                      <SourceMediaReadRow key={media.id} media={media} />
                    ))}
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* JOURNALIST PROOF — read-only with download */}
          <TabsContent value="proof" className="mt-4">
            {journalistProofMedia.length > 0 ? (
              <JournalistProofList proofMedia={journalistProofMedia} />
            ) : (
              <p className="text-muted-foreground text-sm">
                Aucune preuve journalistique ajoutée pour l&apos;instant.
              </p>
            )}
          </TabsContent>

          <TabsContent value="contributions" className="mt-4">
            <div className="grid gap-3">
              {watcherEvidence.map((e) => (
                <WatcherEvidenceCard
                  key={e.id}
                  evidence={e}
                  withClassification={false}
                  investigationId={dossier.id}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <NotesBlock notes={dossier.notes} readOnly />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
