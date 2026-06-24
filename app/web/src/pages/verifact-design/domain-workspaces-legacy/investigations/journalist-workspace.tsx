import { ClipboardCheck, FilePlus2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { Input } from '@shared/ui/shadcn/input'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { MediaDropzone } from '../shared'
import {
  CATEGORY_OPTIONS,
  MEDIA_TYPE_OPTIONS,
  RELIABILITY_OPTIONS,
  SELECT_CLASS,
  SOURCE_TYPE_OPTIONS,
} from './config'
import {
  JournalistProofList,
  SourceMediaCard,
  WatcherEvidenceCard,
} from './media-cards'
import { DossierHeader, MetaCell, OriginBadge } from './primitives'
import type {
  Dossier,
  JournalistProofMedia,
  SourceGroup,
  WatcherEvidenceItem,
} from './types'

export function JournalistInvestigationWorkspace({
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
  const [proofType, setProofType] = useState('LINK')
  const [mediaCategory, setMediaCategory] = useState<string>(dossier.category ?? '')
  const [draftVerdict, setDraftVerdict] = useState<string>(dossier.verdict ?? 'UNVERIFIABLE')

  // Snapshot taken at mount — the journalist must change something before submit is allowed
  const initialCategory = useRef(dossier.category ?? '')
  const initialVerdict = useRef(dossier.verdict ?? 'UNVERIFIABLE')

  const isDirty =
    mediaCategory !== initialCategory.current ||
    draftVerdict !== initialVerdict.current

  const allSourceMedia = sourceGroups.flatMap((g) => g.media)

  const sourceClassified = allSourceMedia.filter(
    (m) => m.category && m.reliability && m.justification,
  ).length

  const allEvidenceMedia = watcherEvidence.flatMap((e) => e.media)
  const evidenceClassified = allEvidenceMedia.filter(
    (m) => m.category && m.reliability && m.justification,
  ).length

  const hasGlobalVerdict = Boolean(mediaCategory)

function handleSubmitForReview() {
    if (!isDirty) {
      toast.error('Aucune modification détectée — mettez à jour le verdict ou la catégorie avant de soumettre.')
      return
    }
    if (!hasGlobalVerdict) {
      toast.error('La catégorie dominante est requise avant la soumission.')
      return
    }
    if (sourceClassified < allSourceMedia.length) {
      toast.error(
        `${allSourceMedia.length - sourceClassified} média(s) source non classifié(s).`,
      )
      return
    }
    if (evidenceClassified < allEvidenceMedia.length) {
      toast.error(
        `${allEvidenceMedia.length - evidenceClassified} contribution(s) vigie non classifiée(s).`,
      )
      return
    }
    toast.success('Dossier soumis en revue.')
  }

  return (
    <AppLayout actor="journalist" page="investigations">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <DossierHeader
              dossier={dossier}
              action={
                <Button size="sm" onClick={handleSubmitForReview}>
                  <ClipboardCheck className="size-4" />
                  Soumettre en revue
                </Button>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaCell
                label="Révision"
                value={`Tentative ${dossier.attempts}`}
              />
              <MetaCell label="Mis à jour" value={dossier.updatedAt} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="source">
          <div className="overflow-x-auto pb-px">
            <TabsList>
              <TabsTrigger value="source">
                Médias source ({allSourceMedia.length})
              </TabsTrigger>
              <TabsTrigger value="proof">
                Mes preuves ({journalistProofMedia.length})
              </TabsTrigger>
              <TabsTrigger value="watchers">
                Vigies ({watcherEvidence.length})
              </TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>

          {/* SOURCE — classify citizen + director media */}
          <TabsContent value="source" className="mt-4">
            <div className="grid gap-6">
              {sourceGroups.filter((g) => g.media.length > 0).map((group) => (
                <div key={group.origin} className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <OriginBadge origin={group.origin} />
                    <span className="text-muted-foreground text-sm">
                      {group.media.length} média{group.media.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {group.submitterNote && (
                    <div className="border-l-2 pl-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                        Note du signalant
                      </p>
                      <p className="text-sm">{group.submitterNote}</p>
                    </div>
                  )}
                  {group.media.map((m) => (
                    <SourceMediaCard key={m.title} media={m} />
                  ))}
                </div>
              ))}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Verdict &amp; notes du brouillon
                </CardTitle>
                <CardDescription>
                  Le verdict global et la catégorie dominante sont requis avant
                  de soumettre en revue. Les notes sont visibles par la
                  direction.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Label className="grid gap-1.5 text-sm">
                    Catégorie dominante
                    <select
                      value={mediaCategory}
                      onChange={(e) => setMediaCategory(e.target.value)}
                      className={SELECT_CLASS}
                    >
                      <option value="" disabled>
                        Choisir une catégorie
                      </option>
                      {CATEGORY_OPTIONS.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Label>
                  <Label className="grid gap-1.5 text-sm">
                    Verdict brouillon
                    <select
                      value={draftVerdict}
                      onChange={(e) => setDraftVerdict(e.target.value)}
                      className={SELECT_CLASS}
                    >
                      {RELIABILITY_OPTIONS.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Label>
                </div>
                <Label className="grid gap-1.5 text-sm">
                  Notes d&apos;enquête
                  <Textarea
                    defaultValue={dossier.notes}
                    rows={5}
                    className="resize-none"
                    placeholder="Vos observations de travail — visibles par la direction lors de la revue."
                  />
                </Label>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
