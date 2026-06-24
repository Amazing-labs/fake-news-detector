import { Archive, BadgeCheck, Ban, PenLine, XCircle } from 'lucide-react'
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
import { ArbitrationReasonDialog, PublishInvestigationDialog } from '../shared'
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

export function DirectorInvestigationWorkspace({
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
  const canPublish = ['TRUE', 'FALSE', 'MISLEADING'].includes(dossier.verdict)
  const canArchive = dossier.verdict === 'UNVERIFIABLE'

  return (
    <AppLayout actor="director" page="investigations">
      <div className="grid gap-4">
        {/* Arbitrage card — always visible */}
        <Card>
          <CardHeader>
            <DossierHeader dossier={dossier} />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetaCell
                label="Verdict brouillon"
                value={domainLabel(dossier.verdict)}
              />
              <MetaCell
                label="Catégorie"
                value={domainLabel(dossier.category)}
              />
              <MetaCell label="Journaliste" value={dossier.journalist} />
              <MetaCell
                label="Révision"
                value={`Tentative ${dossier.attempts}`}
              />
            </div>

            <div className="bg-muted/40 grid gap-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Arbitrage éditorial</p>
              <div className="flex flex-wrap gap-2">
                {canPublish && (
                  <PublishInvestigationDialog>
                    <Button size="sm">
                      <BadgeCheck className="size-4" />
                      Publier
                    </Button>
                  </PublishInvestigationDialog>
                )}
                {canArchive && (
                  <ArbitrationReasonDialog action="Archiver le dossier">
                    <Button size="sm">
                      <Archive className="size-4" />
                      Archiver
                    </Button>
                  </ArbitrationReasonDialog>
                )}
                <ArbitrationReasonDialog action="Demander une correction">
                  <Button variant="outline" size="sm">
                    <PenLine className="size-4" />
                    Correction
                  </Button>
                </ArbitrationReasonDialog>
                <ArbitrationReasonDialog
                  action="Annuler le dossier"
                  tone="destructive"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                  >
                    <Ban className="size-4" />
                    Annuler
                  </Button>
                </ArbitrationReasonDialog>
                <ArbitrationReasonDialog
                  action="Rejeter le dossier"
                  tone="destructive"
                >
                  <Button variant="destructive" size="sm">
                    <XCircle className="size-4" />
                    Rejeter
                  </Button>
                </ArbitrationReasonDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed review — read-only */}
        <Tabs defaultValue="source">
          <div className="overflow-x-auto pb-px">
            <TabsList>
              <TabsTrigger value="source">
                Médias source ({sourceGroups.flatMap((g) => g.media).length})
              </TabsTrigger>
              <TabsTrigger value="proof">
                Preuves journaliste ({journalistProofMedia.length})
              </TabsTrigger>
              <TabsTrigger value="watchers">
                Vigies ({watcherEvidence.length})
              </TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>

          {/* SOURCE — classified, read-only, grouped by origin */}
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
                    {group.submitterNote && (
                      <div className="border-l-2 pl-3">
                        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                          Note du signalant
                        </p>
                        <p className="text-sm">{group.submitterNote}</p>
                      </div>
                    )}
                    {group.media.map((media) => (
                      <SourceMediaReadRow key={media.title} media={media} />
                    ))}
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="proof" className="mt-4">
            <JournalistProofList proofMedia={journalistProofMedia} />
          </TabsContent>

          <TabsContent value="watchers" className="mt-4">
            <div className="grid gap-3">
              {watcherEvidence.map((e) => (
                <WatcherEvidenceCard
                  key={e.title}
                  evidence={e}
                  withClassification={false}
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
