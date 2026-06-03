import { Link } from '@tanstack/react-router'
import {
  Archive,
  BadgeCheck,
  Ban,
  ClipboardCheck,
  FilePlus2,
  PenLine,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../../shared/lib/utils'
import { Badge } from '../../../shared/ui/shadcn/badge'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/shadcn/card'
import { Input } from '../../../shared/ui/shadcn/input'
import { Label } from '../../../shared/ui/shadcn/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/ui/shadcn/tabs'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { domainLabel } from '../workspace-labels'
import { StatusBadge } from '../workspace-ui'
import { investigations } from '../workspace-mocks'
import {
  ArbitrationReasonDialog,
  MediaDropzone,
  PublishInvestigationDialog,
} from './shared'

export function InvestigationsWorkspacePage({
  defaultTab = 'pending',
}: {
  defaultTab?: 'pending' | 'published' | 'canceled'
}) {
  return (
    <AppLayout actor="director" page="investigations">
      <Tabs defaultValue={defaultTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="published">Publiees</TabsTrigger>
            <TabsTrigger value="canceled">Annulees</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link
              to="/publications/corrections"
              search={{ publicationId: undefined }}
            >
              <RotateCcw />
              Créer un correctif
            </Link>
          </Button>
        </div>
        <TabsContent value="pending" className="mt-4">
          <InvestigationList status="PENDING_REVIEW" />
        </TabsContent>
        <TabsContent value="published" className="mt-4">
          <InvestigationList status="PUBLISHED" />
        </TabsContent>
        <TabsContent value="canceled" className="mt-4">
          <InvestigationList status="NEEDS_REVISION" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function InvestigationList({ status }: { status: string }) {
  const rows = investigations.filter((item) => item.status === status)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des enquetes</CardTitle>
        <CardDescription>
          Le détail contient les actions de publication, rejet et archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.map((item) => (
            <div
              key={item.title}
              className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.journalist} / {item.category} / {item.evidence}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: 'demo' }}
                >
                  Voir le detail
                </Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucun dossier pour ce filtre</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les enquetes apparaitront ici quand leur statut changera.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function InvestigationDetailWorkspacePage({
  investigationId,
}: {
  investigationId?: string
}) {
  const { actor } = useResolvedActor('director')
  const dossier = {
    id: investigationId ?? 'selection courante',
    title: 'Video de checkpoint sortie de contexte',
    subject: "Vérifier le lieu, la date et l'unité présente dans la séquence.",
    journalist: 'Maimouna Traore',
    status: 'PENDING_REVIEW',
    category: 'CONTEXT_COLLAPSE',
    verdict: 'MISLEADING',
    attempts: 1,
    updatedAt: '16 mai 2026, 18:40',
    notes:
      'La séquence est authentique mais ancienne. Elle est republiée comme si elle documentait la situation actuelle.',
  }

  const sourceMedia = [
    {
      title: 'Video initiale recue depuis le signalement citoyen',
      type: 'VIDEO',
      origin: 'CITIZEN_REPORT',
      reliability: 'MISLEADING',
      category: 'CONTEXT_COLLAPSE',
      justification:
        "Les uniformes et le décor correspondent à une patrouille archivée, pas à l'événement actuel.",
    },
    {
      title: 'Capture publiée par la direction',
      type: 'IMAGE',
      origin: 'DIRECTOR_INITIATED',
      reliability: 'UNVERIFIABLE',
      category: 'OTHER',
      justification:
        'La capture seule ne permet pas d etablir la date ni le lieu.',
    },
  ]

  const watcherEvidence = [
    {
      title: 'Comparaison du decor',
      watcher: 'Awa Diarra',
      media: '2 images',
      category: 'CONTEXT_COLLAPSE',
      reliability: 'TRUE',
      note: 'Le panneau visible dans la video correspond a l ancien checkpoint.',
    },
    {
      title: 'Recherche de publication anterieure',
      watcher: 'Malik Sissoko',
      media: '1 lien',
      category: 'MISLEADING',
      reliability: 'TRUE',
      note: 'Le même extrait circule déjà dans une archive de 2022.',
    },
  ]

  if (actor === 'journalist') {
    return (
      <JournalistInvestigationWorkspace
        dossier={dossier}
        sourceMedia={sourceMedia}
        watcherEvidence={watcherEvidence}
      />
    )
  }

  return (
    <AppLayout actor={actor} page="investigations">
      <div className="grid gap-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{dossier.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl">
                    {dossier.subject}
                  </CardDescription>
                </div>
                <StatusBadge status={dossier.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="bg-muted/40 grid gap-3 rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Arbitrage direction</p>
                    <p className="text-muted-foreground text-sm">
                      Publier, renvoyer en correction, archiver ou annuler ce
                      dossier.
                    </p>
                  </div>
                  <PublishInvestigationDialog>
                    <Button size="sm">
                      <BadgeCheck />
                      Publier
                    </Button>
                  </PublishInvestigationDialog>
                </div>
                <div
                  className={cn(
                    'grid gap-2',
                    dossier.verdict === 'MISLEADING'
                      ? 'sm:grid-cols-4'
                      : 'sm:grid-cols-3',
                  )}
                >
                  <ArbitrationReasonDialog action="Demander une correction">
                    <Button variant="outline" size="sm">
                      <PenLine />
                      Correction
                    </Button>
                  </ArbitrationReasonDialog>
                  {dossier.verdict === 'MISLEADING' ? (
                    <ArbitrationReasonDialog action="Archiver le dossier">
                      <Button variant="outline" size="sm">
                        <Archive />
                        Archiver
                      </Button>
                    </ArbitrationReasonDialog>
                  ) : null}
                  <ArbitrationReasonDialog
                    action="Annuler le dossier"
                    tone="destructive"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <Ban />
                      Annuler
                    </Button>
                  </ArbitrationReasonDialog>
                  <ArbitrationReasonDialog
                    action="Rejeter le dossier"
                    tone="destructive"
                  >
                    <Button variant="destructive" size="sm">
                      <XCircle />
                      Rejeter
                    </Button>
                  </ArbitrationReasonDialog>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Verdict brouillon
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.verdict)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Catégorie
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.category)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Journaliste
                  </p>
                  <p className="mt-1 font-medium">{dossier.journalist}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Revision
                  </p>
                  <p className="mt-1 font-medium">
                    Tentative {dossier.attempts}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Notes d'enquête</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {dossier.notes}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Médias analysés</CardTitle>
              <CardDescription>
                Médias issus du signalement, de la direction ou du journaliste.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {sourceMedia.map((media) => (
                <div key={media.title} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{media.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {domainLabel(media.origin)} / {domainLabel(media.type)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {domainLabel(media.reliability)}
                      </Badge>
                      <Badge variant="outline">
                        {domainLabel(media.category)}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {media.justification}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions vigies</CardTitle>
              <CardDescription>
                Preuves envoyees par les vigies et relues avant arbitrage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {watcherEvidence.map((evidence) => (
                <div key={evidence.title} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{evidence.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {evidence.watcher} / {evidence.media}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {domainLabel(evidence.reliability)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {evidence.note}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

function JournalistInvestigationWorkspace({
  dossier,
  sourceMedia,
  watcherEvidence,
}: {
  dossier: {
    title: string
    subject: string
    journalist: string
    status: string
    category: string
    verdict: string
    attempts: number
    updatedAt: string
    notes: string
  }
  sourceMedia: Array<{
    title: string
    type: string
    origin: string
    reliability: string
    category: string
    justification: string
  }>
  watcherEvidence: Array<{
    title: string
    watcher: string
    media: string
    category?: string
    reliability?: string
    note: string
  }>
}) {
  const [proofMediaType, setProofMediaType] = useState('LINK')
  const isProofLink = proofMediaType === 'LINK'

  return (
    <AppLayout actor="journalist" page="investigations">
      <div className="grid gap-6">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{dossier.title}</CardTitle>
                  <CardDescription className="mt-2 max-w-2xl">
                    {dossier.subject}
                  </CardDescription>
                </div>
                <StatusBadge status={dossier.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Verdict brouillon
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.verdict)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Catégorie dominante
                  </p>
                  <p className="mt-1 font-medium">
                    {domainLabel(dossier.category)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Revision
                  </p>
                  <p className="mt-1 font-medium">
                    Tentative {dossier.attempts}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Derniere mise a jour
                  </p>
                  <p className="mt-1 font-medium">{dossier.updatedAt}</p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="font-medium">Notes d'enquête</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {dossier.notes}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button>
                  <ClipboardCheck />
                  Soumettre en revue
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/inbox-subjects/global">Retour aux sujets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classification des medias source</CardTitle>
              <CardDescription>
                Le backend attend categorie, fiabilite et justification pour
                chaque média issu du sujet.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {sourceMedia.map((media) => (
                <div
                  key={media.title}
                  className="grid gap-4 rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{media.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {domainLabel(media.origin)} / {domainLabel(media.type)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {domainLabel(media.category)}
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Label className="grid gap-2">
                      Catégorie
                      <select
                        defaultValue={media.category}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                      >
                        <option value="CONTEXT_COLLAPSE">
                          Contexte detourne
                        </option>
                        <option value="MANIPULATED">Manipule</option>
                        <option value="FABRICATED">Fabrique</option>
                        <option value="SATIRE">Satire</option>
                        <option value="MISLEADING">Trompeur</option>
                        <option value="IMPOSTOR">Usurpation</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </Label>
                    <Label className="grid gap-2">
                      Fiabilite
                      <select
                        defaultValue={media.reliability}
                        className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                      >
                        <option value="TRUE">Vrai</option>
                        <option value="FALSE">Faux</option>
                        <option value="MISLEADING">Trompeur</option>
                        <option value="UNVERIFIABLE">Non vérifiable</option>
                      </select>
                    </Label>
                  </div>
                  <Label className="grid gap-2">
                    Justification
                    <Textarea defaultValue={media.justification} />
                  </Label>
                  <Button size="sm" className="w-fit">
                    Enregistrer la classification
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ajouter une preuve journalistique</CardTitle>
              <CardDescription>
                Ajoute une URL vérifiée et la source d'autorité rattachée.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Label className="grid gap-2">
                  Type de média
                  <select
                    value={proofMediaType}
                    onChange={(event) => setProofMediaType(event.target.value)}
                    className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                  >
                    <option value="LINK">Lien</option>
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="AUDIO">Audio</option>
                    <option value="TEXT">Texte</option>
                  </select>
                </Label>
                <Label className="grid gap-2">
                  Source d'autorité
                  <Input placeholder="Nom de la source" />
                </Label>
                <Label className="grid gap-2">
                  Type de source
                  <select className="border-input bg-background h-10 rounded-md border px-3 text-sm">
                    <option value="OFFICIAL_DECREE">Decision officielle</option>
                    <option value="ORIGINAL_RETRACTION">
                      Rectificatif original
                    </option>
                    <option value="DIRECT_EVIDENCE">Preuve directe</option>
                    <option value="MEDIA_CROSSCHECK">Recoupement média</option>
                    <option value="AUTHORITY_STATEMENT">
                      Déclaration d'autorité
                    </option>
                  </select>
                </Label>
              </div>
              {isProofLink ? (
                <Label className="grid gap-2">
                  URL de la preuve
                  <Input placeholder="https://..." type="url" />
                </Label>
              ) : (
                <MediaDropzone
                  inputId="journalist-proof-media"
                  description="Dépose un fichier ou sélectionne le média vérifié à joindre à cette preuve."
                />
              )}
              <Button className="w-fit">
                <FilePlus2 />
                Ajouter la preuve
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions vigies</CardTitle>
              <CardDescription>
                Les apports des vigies restent consultables pour consolider le
                dossier.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {watcherEvidence.map((evidence) => {
                const hasClassification = Boolean(evidence.reliability)

                return (
                  <div key={evidence.title} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{evidence.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {evidence.watcher} / {evidence.media}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {evidence.category
                            ? domainLabel(evidence.category)
                            : 'Catégorie à définir'}
                        </Badge>
                        <Badge variant="secondary">
                          {evidence.reliability
                            ? domainLabel(evidence.reliability)
                            : 'Verdict a definir'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">
                      {evidence.note}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <Label className="grid gap-2">
                        Catégorie
                        <select
                          defaultValue={evidence.category ?? ''}
                          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                        >
                          <option value="" disabled>
                            Choisir une categorie
                          </option>
                          <option value="CONTEXT_COLLAPSE">
                            Contexte detourne
                          </option>
                          <option value="MANIPULATED">Manipule</option>
                          <option value="FABRICATED">Fabrique</option>
                          <option value="SATIRE">Satire</option>
                          <option value="MISLEADING">Trompeur</option>
                          <option value="IMPOSTOR">Usurpation</option>
                          <option value="OTHER">Autre</option>
                        </select>
                      </Label>
                      <Label className="grid gap-2">
                        Verdict
                        <select
                          defaultValue={evidence.reliability ?? ''}
                          className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                        >
                          <option value="" disabled>
                            Choisir un verdict
                          </option>
                          <option value="TRUE">Vrai</option>
                          <option value="FALSE">Faux</option>
                          <option value="MISLEADING">Trompeur</option>
                          <option value="UNVERIFIABLE">Non vérifiable</option>
                        </select>
                      </Label>
                      <Label className="grid gap-2 md:col-span-2">
                        Justification
                        <Textarea defaultValue={evidence.note} />
                      </Label>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3">
                      {hasClassification ? 'Reclasser' : 'Classer'} cette
                      contribution
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
