import {
  Archive,
  BadgeCheck,
  Ban,
  FileSearch,
  Inbox,
  PenLine,
  Users,
} from 'lucide-react'
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
import { EmptyState, StatusBadge } from '../../workspace-ui'
import { ArbitrationReasonDialog, PublishInvestigationDialog } from '../shared'
import {
  JournalistProofList,
  SourceMediaReadRow,
  WatcherEvidenceCard,
} from './media-cards'
import { MetaCell, NotesBlock, OriginBadge } from './primitives'
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
  const sourceCount = sourceGroups.flatMap((g) => g.media).length

  return (
    <AppLayout actor="director" page="investigations">
      <div className="grid gap-4">
        {/* Arbitrage card — always visible */}
        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Dossier d'arbitrage
                </p>
                <h1 className="mt-1 text-lg leading-snug font-semibold">
                  {dossier.title}
                </h1>
              </div>
              <StatusBadge status={dossier.status} />
            </div>

            {/* Inbox subject content — elevated, quoted, in italics */}
            <blockquote className="border-primary/50 bg-muted/40 rounded-r-lg border-l-2 px-4 py-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Contexte du sujet
              </p>
              <p className="mt-1.5 text-sm leading-relaxed italic">
                {dossier.subject}
              </p>
            </blockquote>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetaCell
                label="Verdict brouillon"
                value={domainLabel(dossier.verdict)}
              />
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

        {/* Tabbed review — read-only */}
        <Tabs defaultValue="source">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            <div className="flex flex-wrap gap-2">
              {canPublish && (
                <PublishInvestigationDialog investigationId={dossier.id}>
                  <Button size="sm">
                    <BadgeCheck className="size-4" />
                    Publier
                  </Button>
                </PublishInvestigationDialog>
              )}
              {canArchive && (
                <ArbitrationReasonDialog
                  investigationId={dossier.id}
                  kind="archive"
                  action="Archiver le dossier"
                >
                  <Button size="sm">
                    <Archive className="size-4" />
                    Archiver
                  </Button>
                </ArbitrationReasonDialog>
              )}
              <ArbitrationReasonDialog
                investigationId={dossier.id}
                kind="reject"
                action="Demander une correction"
              >
                <Button variant="outline" size="sm">
                  <PenLine className="size-4" />
                  Correction
                </Button>
              </ArbitrationReasonDialog>
              <ArbitrationReasonDialog
                investigationId={dossier.id}
                kind="cancel"
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
            </div>
          </div>

          {/* SOURCE — classified, read-only, grouped by origin */}
          <TabsContent value="source" className="mt-4">
            {sourceCount > 0 ? (
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
            ) : (
              <EmptyState
                icon={Inbox}
                title="Aucun média source"
                description="Aucun média n'a été joint au sujet à l'origine de cette enquête."
              />
            )}
          </TabsContent>

          <TabsContent value="proof" className="mt-4">
            {journalistProofMedia.length > 0 ? (
              <JournalistProofList proofMedia={journalistProofMedia} />
            ) : (
              <EmptyState
                icon={FileSearch}
                title="Aucune preuve journalistique"
                description="Le journaliste n'a pas encore versé de preuve à ce dossier."
              />
            )}
          </TabsContent>

          <TabsContent value="watchers" className="mt-4">
            {watcherEvidence.length > 0 ? (
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
            ) : (
              <EmptyState
                icon={Users}
                title="Aucune contribution de vigie"
                description="Les vigies n'ont pas encore contribué à cette enquête."
              />
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <NotesBlock notes={dossier.notes} readOnly />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
