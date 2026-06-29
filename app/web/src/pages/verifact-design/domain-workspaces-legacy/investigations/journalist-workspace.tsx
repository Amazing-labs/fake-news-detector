import { ClipboardCheck, FilePlus2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  addJournalistProofMedia,
  investigationQueryKeys,
  saveInvestigationDraft,
  submitInvestigationForReview,
} from '@entities/investigation/api'
import { toApiErrorMessage } from '@shared/api/http'
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
  MediaCategory,
  MediaType,
  SourceType,
  Verdict,
} from '@entities/investigation/schemas'
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
  const queryClient = useQueryClient()

  const [proofType, setProofType] = useState<MediaType>('LINK')
  const [proofAuthorityName, setProofAuthorityName] = useState('')
  const [proofSourceType, setProofSourceType] = useState<SourceType>(
    SOURCE_TYPE_OPTIONS[0][0] as SourceType,
  )
  const [proofUrl, setProofUrl] = useState('')
  const [proofUploadedUrls, setProofUploadedUrls] = useState<string[]>([])

  const [mediaCategory, setMediaCategory] = useState<MediaCategory | ''>(
    dossier.category ?? '',
  )
  const [draftVerdict, setDraftVerdict] = useState<Verdict>(
    dossier.verdict ?? 'UNVERIFIABLE',
  )
  const [notes, setNotes] = useState<string>(dossier.notes ?? '')

  const allSourceMedia = sourceGroups.flatMap((g) => g.media)
  const allEvidenceMedia = watcherEvidence.flatMap((e) => e.media)

  const buildDraftInput = () => ({
    mediaCategory: mediaCategory === '' ? null : mediaCategory,
    draftVerdict,
    investigationNotes: notes,
  })

  const saveDraftMutation = useMutation({
    mutationFn: () => saveInvestigationDraft(dossier.id, buildDraftInput()),
    onSuccess: () => {
      toast.success('Brouillon enregistré.')
      void queryClient.invalidateQueries({
        queryKey: investigationQueryKeys.detail(dossier.id),
      })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      await saveInvestigationDraft(dossier.id, buildDraftInput())
      await submitInvestigationForReview(dossier.id)
    },
    onSuccess: () => {
      toast.success('Dossier soumis en revue.')
      void queryClient.invalidateQueries({
        queryKey: investigationQueryKeys.all,
      })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  // A LINK proof comes from the typed URL field; every other type comes from an
  // uploaded asset. Keep them strictly separated so switching type can never
  // submit a stale URL that belongs to the other input.
  const proofUrlValue =
    proofType === 'LINK' ? proofUrl.trim() : (proofUploadedUrls[0] ?? '')
  const addProofMutation = useMutation({
    mutationFn: () =>
      addJournalistProofMedia(dossier.id, {
        url: proofUrlValue,
        type: proofType,
        authoritySourceName: proofAuthorityName.trim(),
        authoritySourceType: proofSourceType,
      }),
    onSuccess: () => {
      toast.success('Preuve ajoutée.')
      setProofAuthorityName('')
      setProofUrl('')
      setProofUploadedUrls([])
      void queryClient.invalidateQueries({
        queryKey: investigationQueryKeys.sourceMedia(dossier.id),
      })
    },
    onError: (error) => toast.error(toApiErrorMessage(error)),
  })

  function handleSubmitForReview() {
    if (!mediaCategory) {
      toast.error('La catégorie dominante est requise avant la soumission.')
      return
    }
    const sourceClassified = allSourceMedia.filter(
      (m) => m.category && m.reliability && m.justification,
    ).length
    if (sourceClassified < allSourceMedia.length) {
      toast.error(
        `${allSourceMedia.length - sourceClassified} média(s) source non classifié(s).`,
      )
      return
    }
    const evidenceClassified = allEvidenceMedia.filter(
      (m) => m.category && m.reliability && m.justification,
    ).length
    if (evidenceClassified < allEvidenceMedia.length) {
      toast.error(
        `${allEvidenceMedia.length - evidenceClassified} contribution(s) vigie non classifiée(s).`,
      )
      return
    }
    submitMutation.mutate()
  }

  function handleAddProof() {
    if (!proofAuthorityName.trim()) {
      toast.error("La source d'autorité est obligatoire.")
      return
    }
    if (!proofUrlValue) {
      toast.error('Ajoute un fichier ou une URL pour la preuve.')
      return
    }
    try {
      new URL(proofUrlValue)
    } catch {
      toast.error('La preuve doit être une URL valide.')
      return
    }
    addProofMutation.mutate()
  }

  return (
    <AppLayout actor="journalist" page="investigations">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <DossierHeader
              dossier={dossier}
              action={
                <Button
                  size="sm"
                  onClick={handleSubmitForReview}
                  loading={submitMutation.isPending}
                >
                  {!submitMutation.isPending && (
                    <ClipboardCheck className="size-4" />
                  )}
                  {submitMutation.isPending
                    ? 'Soumission…'
                    : 'Soumettre en revue'}
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
                    {group.media.map((m) => (
                      <SourceMediaCard
                        key={m.id}
                        media={m}
                        investigationId={dossier.id}
                      />
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
                        onChange={(e) => {
                          setProofType(e.target.value as MediaType)
                          setProofUrl('')
                          setProofUploadedUrls([])
                        }}
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
                      <Input
                        placeholder="Nom de la source"
                        value={proofAuthorityName}
                        onChange={(e) => setProofAuthorityName(e.target.value)}
                      />
                    </Label>
                    <Label className="grid gap-1.5 text-sm">
                      Type de source
                      <select
                        value={proofSourceType}
                        onChange={(e) =>
                          setProofSourceType(e.target.value as SourceType)
                        }
                        className={SELECT_CLASS}
                      >
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
                    key={proofType}
                    inputId="journalist-proof-media"
                    description="Glissez un fichier ou collez une URL ci-dessous pour les liens."
                    onUrlsChange={setProofUploadedUrls}
                  />
                  {proofType === 'LINK' && (
                    <Label className="grid gap-1.5 text-sm">
                      URL
                      <Input
                        placeholder="https://…"
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                      />
                    </Label>
                  )}
                  <Button
                    className="w-fit"
                    onClick={handleAddProof}
                    loading={addProofMutation.isPending}
                  >
                    {!addProofMutation.isPending && (
                      <FilePlus2 className="size-4" />
                    )}
                    {addProofMutation.isPending
                      ? 'Ajout…'
                      : 'Ajouter la preuve'}
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
                  key={e.id}
                  evidence={e}
                  withClassification
                  investigationId={dossier.id}
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
                      onChange={(e) =>
                        setMediaCategory(e.target.value as MediaCategory)
                      }
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
                      onChange={(e) =>
                        setDraftVerdict(e.target.value as Verdict)
                      }
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
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    className="resize-none"
                    placeholder="Vos observations de travail — visibles par la direction lors de la revue."
                  />
                </Label>
                <Button
                  size="sm"
                  className="w-fit"
                  onClick={() => saveDraftMutation.mutate()}
                  loading={saveDraftMutation.isPending}
                >
                  {saveDraftMutation.isPending
                    ? 'Enregistrement…'
                    : 'Enregistrer le brouillon'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
