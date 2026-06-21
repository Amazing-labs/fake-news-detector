import { ClipboardCheck, FilePlus2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../shared/ui/shadcn/card'
import { Input } from '../../../../shared/ui/shadcn/input'
import { Label } from '../../../../shared/ui/shadcn/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { domainLabel } from '../../workspace-labels'
import { MediaDropzone } from '../shared'
import { MEDIA_TYPE_OPTIONS, SELECT_CLASS, SOURCE_TYPE_OPTIONS } from './config'
import {
  JournalistProofList,
  SourceMediaCard,
  WatcherEvidenceCard,
} from './media-cards'
import { DossierHeader, MetaCell, NotesBlock, OriginBadge } from './primitives'
import type {
  Dossier,
  JournalistProofMedia,
  SourceMedia,
  WatcherEvidenceItem,
} from './types'

export function JournalistInvestigationWorkspace({
  dossier,
  sourceMedia,
  journalistProofMedia,
  watcherEvidence,
}: {
  dossier: Dossier
  sourceMedia: SourceMedia[]
  journalistProofMedia: JournalistProofMedia[]
  watcherEvidence: WatcherEvidenceItem[]
}) {
  const [proofType, setProofType] = useState('LINK')
  const citizenMedia = sourceMedia.filter((m) => m.origin === 'CITIZEN_REPORT')
  const directorMedia = sourceMedia.filter(
    (m) => m.origin === 'DIRECTOR_INITIATED',
  )

  return (
    <AppLayout actor="journalist" page="investigations">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <DossierHeader
              dossier={dossier}
              action={
                <Button size="sm">
                  <ClipboardCheck className="size-4" />
                  Soumettre en revue
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetaCell
                label="Verdict brouillon"
                value={domainLabel(dossier.verdict)}
              />
              <MetaCell
                label="Catégorie dominante"
                value={domainLabel(dossier.category)}
              />
              <MetaCell
                label="Révision"
                value={`Tentative ${dossier.attempts}`}
              />
              <MetaCell label="Mis à jour" value={dossier.updatedAt} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="source">
          <TabsList>
            <TabsTrigger value="source">
              Médias source ({sourceMedia.length})
            </TabsTrigger>
            <TabsTrigger value="proof">
              Mes preuves ({journalistProofMedia.length})
            </TabsTrigger>
            <TabsTrigger value="watchers">
              Vigies ({watcherEvidence.length})
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* SOURCE — classify citizen + director media */}
          <TabsContent value="source" className="mt-4">
            <div className="grid gap-6">
              {citizenMedia.length > 0 && (
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <OriginBadge origin="CITIZEN_REPORT" />
                    <span className="text-muted-foreground text-sm">
                      {citizenMedia.length} média
                      {citizenMedia.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {citizenMedia.map((m) => (
                    <SourceMediaCard key={m.title} media={m} />
                  ))}
                </div>
              )}
              {directorMedia.length > 0 && (
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <OriginBadge origin="DIRECTOR_INITIATED" />
                    <span className="text-muted-foreground text-sm">
                      {directorMedia.length} média
                      {directorMedia.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {directorMedia.map((m) => (
                    <SourceMediaCard key={m.title} media={m} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* PROOF — authority source required, no category/reliability */}
          <TabsContent value="proof" className="mt-4">
            <div className="grid gap-6">
              <JournalistProofList proofMedia={journalistProofMedia} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Ajouter une preuve journalistique
                  </CardTitle>
                  <CardDescription>
                    Source d'autorité requise — aucune classification de
                    catégorie sur les preuves journaliste.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Label className="grid gap-1.5 text-sm">
                      Type
                      <select
                        value={proofType}
                        onChange={(e) => setProofType(e.target.value)}
                        className={SELECT_CLASS}
                      >
                        {MEDIA_TYPE_OPTIONS.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Label>
                    <Label className="grid gap-1.5 text-sm">
                      Source d'autorité
                      <Input placeholder="Nom de la source" />
                    </Label>
                    <Label className="grid gap-1.5 text-sm">
                      Type de source
                      <select className={SELECT_CLASS}>
                        {SOURCE_TYPE_OPTIONS.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </Label>
                  </div>
                  {/* Always show drag-and-drop — URL field additionally for LINK type */}
                  <MediaDropzone
                    inputId="journalist-proof-media"
                    description="Glissez un fichier ou collez une URL ci-dessous pour les liens."
                  />
                  {proofType === 'LINK' && (
                    <Label className="grid gap-1.5 text-sm">
                      URL
                      <Input placeholder="https://…" type="url" />
                    </Label>
                  )}
                  <Button className="w-fit">
                    <FilePlus2 className="size-4" />
                    Ajouter la preuve
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* WATCHERS — read + classify contributions */}
          <TabsContent value="watchers" className="mt-4">
            <div className="grid gap-3">
              {watcherEvidence.map((e) => (
                <WatcherEvidenceCard
                  key={e.title}
                  evidence={e}
                  withClassification
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <NotesBlock notes={dossier.notes} readOnly={false} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
