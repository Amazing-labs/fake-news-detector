import { FilePlus2 } from 'lucide-react'
import { Button } from '../../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../../shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { domainLabel } from '../../workspace-labels'
import { WatcherContributeDialog } from '../shared'
import { WatcherEvidenceCard } from './media-cards'
import { DossierHeader, MetaCell, NotesBlock } from './primitives'
import type { Dossier, WatcherEvidenceItem } from './types'

export function WatcherInvestigationWorkspace({
  dossier,
  watcherEvidence,
}: {
  dossier: Dossier
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
                value={domainLabel(dossier.category)}
              />
              <MetaCell label="Journaliste" value={dossier.journalist} />
              <MetaCell
                label="Révision"
                value={`Tentative ${dossier.attempts}`}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="contributions">
          <TabsList>
            <TabsTrigger value="contributions">
              Contributions ({watcherEvidence.length})
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="contributions" className="mt-4">
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
