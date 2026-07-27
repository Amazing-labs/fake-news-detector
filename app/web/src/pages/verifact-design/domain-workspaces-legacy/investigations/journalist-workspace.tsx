import { ClipboardCheck, FilePlus2, Inbox, Users } from 'lucide-react'
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
import { useAppSession } from '@entities/session/model'
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
import { MediaFields } from '@shared/ui/media-fields'
import {
  normalizeMediaDrafts,
  type MediaDraft,
} from '@shared/ui/media-fields.model'
import { AppLayout } from '../../app-layout'
import {
  RELIABILITY_OPTIONS,
  SELECT_CLASS,
  SOURCE_TYPE_OPTIONS,
} from './config'
import {
  JournalistProofList,
  SourceMediaCard,
  SourceMediaReadRow,
  WatcherEvidenceCard,
} from './media-cards'
import {
  ActionGuard,
  BlockedNotice,
  CategorySelect,
  DossierHeader,
  MetaCell,
  OriginBadge,
} from './primitives'
import { journalistDossierAccess } from '@entities/investigation/policy'
import { EmptyState } from '../../workspace-ui'
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
  const { session } = useAppSession()
  const ownerId = session?.user.actorId ?? ''
  // A dossier in review or already closed is read-only for its journalist —
  // the domain refuses every write, so the workspace stops offering them.
  const access = journalistDossierAccess(dossier.status)
  const isEditable = access.enabled

  const [proofAuthorityName, setProofAuthorityName] = useState('')
  const [proofSourceType, setProofSourceType] = useState<SourceType>(
    SOURCE_TYPE_OPTIONS[0][0] as SourceType,
  )
  const [proofUrl, setProofUrl] = useState('')
  const [proofMedia, setProofMedia] = useState<MediaDraft[]>([])

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

  // One proof = one media + its own authority source, because the journalist
  // must be able to credit a different source on each one. The proof is either
  // an uploaded file (its type comes from the upload) or a link.
  const trimmedProofUrl = proofUrl.trim()
  const uploadedProof = normalizeMediaDrafts(proofMedia)[0]
  const pendingProof: { url: string; type: MediaType } | null = uploadedProof
    ? { url: uploadedProof.url, type: uploadedProof.type }
    : trimmedProofUrl
      ? { url: trimmedProofUrl, type: 'LINK' }
      : null
  const canAddProof = proofAuthorityName.trim() !== '' && pendingProof !== null

  const addProofMutation = useMutation({
    mutationFn: () => {
      if (!pendingProof) throw new Error('Aucune preuve à ajouter.')
      return addJournalistProofMedia(dossier.id, {
        url: pendingProof.url,
        type: pendingProof.type,
        authoritySourceName: proofAuthorityName.trim(),
        authoritySourceType: proofSourceType,
      })
    },
    onSuccess: () => {
      toast.success('Preuve ajoutée.')
      setProofAuthorityName('')
      setProofUrl('')
      setProofMedia([])
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
    if (trimmedProofUrl) {
      try {
        new URL(trimmedProofUrl)
      } catch {
        toast.error('Le lien doit être une URL valide (ex: https://…).')
        return
      }
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
                <ActionGuard action={access}>
                  <Button
                    size="sm"
                    onClick={handleSubmitForReview}
                    disabled={!isEditable}
                    loading={submitMutation.isPending}
                  >
                    {!submitMutation.isPending && (
                      <ClipboardCheck className="size-4" />
                    )}
                    {submitMutation.isPending
                      ? 'Soumission…'
                      : 'Soumettre en revue'}
                  </Button>
                </ActionGuard>
              }
            />
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaCell
                label="Révision"
                value={`Tentative ${dossier.attempts}`}
              />
              <MetaCell label="Mis à jour" value={dossier.updatedAt} />
            </div>
            <BlockedNotice action={access} />
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
            {allSourceMedia.length > 0 ? (
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
                      {group.media.map((m) =>
                        isEditable ? (
                          <SourceMediaCard
                            key={m.id}
                            media={m}
                            investigationId={dossier.id}
                          />
                        ) : (
                          <SourceMediaReadRow key={m.id} media={m} />
                        ),
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title="Aucun média source"
                description="Le sujet à l'origine de cette enquête ne comporte pas de média à classifier."
              />
            )}
          </TabsContent>

          {/* PROOF — authority source required, no category/reliability */}
          <TabsContent value="proof" className="mt-4">
            <div className="grid gap-6">
              <JournalistProofList proofMedia={journalistProofMedia} />
              {isEditable ? (
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
                    <div className="grid gap-3 md:grid-cols-2">
                      <Label className="grid gap-1.5 text-sm">
                        Source d'autorité
                        <Input
                          placeholder="Nom de la source"
                          value={proofAuthorityName}
                          onChange={(e) =>
                            setProofAuthorityName(e.target.value)
                          }
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
                    <MediaFields
                      title="Média de la preuve"
                      description="Un fichier par preuve — son type est détecté automatiquement."
                      items={proofMedia}
                      onChange={setProofMedia}
                      ownerId={ownerId}
                      maxItems={1}
                      disabled={
                        addProofMutation.isPending || trimmedProofUrl !== ''
                      }
                    />
                    <Label className="grid gap-1.5 text-sm">
                      Lien
                      <Input
                        placeholder="https://…"
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        disabled={
                          addProofMutation.isPending ||
                          uploadedProof !== undefined
                        }
                      />
                      <span className="text-muted-foreground text-xs">
                        Une preuve est soit un fichier, soit un lien.
                      </span>
                    </Label>
                    <Button
                      className="w-fit"
                      onClick={handleAddProof}
                      disabled={!canAddProof}
                      loading={addProofMutation.isPending}
                    >
                      {!addProofMutation.isPending && (
                        <FilePlus2 className="size-4" />
                      )}
                      Ajouter la preuve
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </TabsContent>

          {/* WATCHERS — read + classify contributions */}
          <TabsContent value="watchers" className="mt-4">
            {watcherEvidence.length > 0 ? (
              <div className="grid gap-3">
                {watcherEvidence.map((e) =>
                  isEditable ? (
                    <WatcherEvidenceCard
                      key={e.id}
                      evidence={e}
                      withClassification
                      investigationId={dossier.id}
                    />
                  ) : (
                    <WatcherEvidenceCard key={e.id} evidence={e} />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="Aucune contribution de vigie"
                description="Les vigies n'ont pas encore documenté cette enquête."
              />
            )}
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
                    <CategorySelect
                      value={mediaCategory}
                      onChange={(value) =>
                        setMediaCategory(value as MediaCategory)
                      }
                      placeholder="Choisir une catégorie"
                      disabled={!isEditable}
                    />
                  </Label>
                  <Label className="grid gap-1.5 text-sm">
                    Verdict brouillon
                    <select
                      value={draftVerdict}
                      onChange={(e) =>
                        setDraftVerdict(e.target.value as Verdict)
                      }
                      className={SELECT_CLASS}
                      disabled={!isEditable}
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
                    disabled={!isEditable}
                    placeholder="Vos observations de travail — visibles par la direction lors de la revue."
                  />
                </Label>
                <ActionGuard action={access}>
                  <Button
                    size="sm"
                    className="w-fit"
                    onClick={() => saveDraftMutation.mutate()}
                    disabled={!isEditable}
                    loading={saveDraftMutation.isPending}
                  >
                    {saveDraftMutation.isPending
                      ? 'Enregistrement…'
                      : 'Enregistrer le brouillon'}
                  </Button>
                </ActionGuard>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
