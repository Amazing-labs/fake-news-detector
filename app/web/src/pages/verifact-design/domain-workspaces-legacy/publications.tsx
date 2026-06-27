import { Link } from '@tanstack/react-router'
import {
  ExternalLink,
  FileSearch,
  Link2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { domainLabel } from '../workspace-labels'
import { MetaCell } from '../workspace-ui'
import {
  getPublication,
  listPublications,
  publicationQueryKeys,
} from '@entities/publication/api'
import { toApiErrorMessage } from '@shared/api/http'
import type { PublicationItem } from '@entities/publication/model'

// ── Publications list ──────────────────────────────────────────────────────────

export function PublicationsWorkspacePage() {
  const { actor } = useResolvedActor('director')
  const canManage = actor === 'director' || actor === 'admin'

  const publicationsQuery = useQuery({
    queryKey: publicationQueryKeys.list(),
    queryFn: () => listPublications(),
  })
  const items = publicationsQuery.data?.items ?? []
  const mainItems = items.filter((item) => !item.isCorrection)
  const correctionItems = items.filter((item) => item.isCorrection)

  return (
    <AppLayout actor={actor} page="publications">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes ({items.length})</TabsTrigger>
          <TabsTrigger value="publications">
            Publications ({mainItems.length})
          </TabsTrigger>
          <TabsTrigger value="corrections">
            Correctifs ({correctionItems.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <PublicationList items={items} canManage={canManage} />
        </TabsContent>
        <TabsContent value="publications" className="mt-4">
          <PublicationList items={mainItems} canManage={canManage} />
        </TabsContent>
        <TabsContent value="corrections" className="mt-4">
          <PublicationList items={correctionItems} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function PublicationList({
  items,
  canManage,
}: {
  items: PublicationItem[]
  canManage: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publications et correctifs</CardTitle>
        <CardDescription>
          Chaque publication conserve son verdict final et ses preuves.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length ? (
          items.map((item) => {
            const publicationId = item.id
            return (
              <div
                key={item.id}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {item.title ?? 'Publication sans titre'}
                    </p>
                    <Badge
                      variant={item.isCorrection ? 'secondary' : 'outline'}
                    >
                      {item.isCorrection ? 'Correctif' : 'Publication'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Verdict : {domainLabel(item.finalVerdict)}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  {canManage && (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        to="/publications/corrections"
                        search={{ publicationId }}
                      >
                        <RotateCcw />
                        Correctif
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted size-8 rounded-full transition-colors"
                    asChild
                  >
                    <Link
                      to="/publications/$publicationId"
                      params={{ publicationId }}
                      aria-label={`Voir le détail de ${item.title ?? publicationId}`}
                    >
                      <ExternalLink />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucune publication ici</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les publications apparaîtront ici une fois validées.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Publication detail ─────────────────────────────────────────────────────────

function evidenceSummary(publication: PublicationItem) {
  const linkCount = publication.verifiedLinks.length
  const mediaCount = publication.verifiedMedia.length
  return `${linkCount} lien(s) · ${mediaCount} média(s)`
}

export function PublicationDetailWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const { actor } = useResolvedActor('director')
  const canManage = actor === 'director' || actor === 'admin'

  const publicationQuery = useQuery({
    queryKey: publicationQueryKeys.detail(publicationId ?? ''),
    queryFn: () => getPublication(publicationId as string),
    enabled: Boolean(publicationId),
  })
  const publication = publicationQuery.data

  if (publicationQuery.isPending) {
    return (
      <AppLayout actor={actor} page="publications">
        <Card>
          <CardContent className="pt-6">Chargement de la publication...</CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (publicationQuery.isError) {
    return (
      <AppLayout actor={actor} page="publications">
        <Card>
          <CardContent className="text-destructive pt-6">
            {toApiErrorMessage(publicationQuery.error)}
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (!publication) return null

  const linkCount = publication.verifiedLinks.length
  const mediaCount = publication.verifiedMedia.length

  return (
    <AppLayout actor={actor} page="publications">
      {/* Header card — all roles */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">
                {publication.title ?? 'Publication sans titre'}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {actor === 'citizen'
                  ? 'Synthèse publique du verdict et des preuves disponibles.'
                  : 'Verdict final, preuves conservées et type de publication.'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant={publication.isCorrection ? 'secondary' : 'outline'}
              >
                {publication.isCorrection ? 'Correctif' : 'Publication'}
              </Badge>
              {canManage && (
                <Button size="sm" asChild>
                  <Link
                    to="/publications/corrections"
                    search={{ publicationId: publication.id }}
                  >
                    <RotateCcw />
                    Créer un correctif
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MetaCell
              label="Verdict"
              value={domainLabel(publication.finalVerdict)}
            />
            <MetaCell label="Preuves" value={evidenceSummary(publication)} />
          </div>
        </CardHeader>
      </Card>

      {/* Citizen: tabbed view over verified sources/media */}
      {actor === 'citizen' ? (
        <Tabs defaultValue="sources">
          <TabsList>
            <TabsTrigger value="sources">Sources ({linkCount})</TabsTrigger>
            <TabsTrigger value="media">Médias ({mediaCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-4">
            {linkCount > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Liens vérifiés</CardTitle>
                  <CardDescription>
                    Ouvre les sources et compare-les avec le verdict avant de
                    partager la publication.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {publication.verifiedLinks.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <Link2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {source.url}
                        </span>
                        {source.authoritySourceName && (
                          <span className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                            <ShieldCheck className="size-3.5" />
                            {source.authoritySourceName}
                          </span>
                        )}
                      </span>
                      <ExternalLink className="text-muted-foreground size-4 shrink-0" />
                    </a>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <EmptyPanel
                title="Aucune source attachée"
                hint="Les sources seront disponibles une fois la publication complète."
              />
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            {mediaCount > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Médias vérifiés</CardTitle>
                  <CardDescription>
                    Médias retenus ou comparés pendant la vérification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
                  {publication.verifiedMedia.map((media) => (
                    <VerifiedMediaCard key={media.id} media={media} />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <EmptyPanel
                title="Aucun média joint"
                hint="Les médias seront disponibles une fois la publication complète."
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Director/admin: trace éditoriale */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trace éditoriale</CardTitle>
            <CardDescription>
              {linkCount} lien(s) et {mediaCount} média(s) vérifié(s) rattachés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              La publication garde le verdict, les sources utilisées et les
              corrections rattachées pour rester consultable par la rédaction.
            </p>
            <Button className="mt-4 w-fit" variant="outline" asChild>
              <Link to="/publications/list">Retour aux publications</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  )
}

function EmptyPanel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{hint}</p>
    </div>
  )
}

function VerifiedMediaCard({
  media,
}: {
  media: PublicationItem['verifiedMedia'][number]
}) {
  const caption = media.authoritySourceName ?? domainLabel(media.type)

  if (media.type === 'IMAGE') {
    return (
      <figure className="bg-card overflow-hidden rounded-lg border">
        <img
          src={media.url}
          alt={caption}
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
        <figcaption className="flex items-center justify-between gap-3 p-3">
          <span className="min-w-0">
            <span className="text-muted-foreground block text-sm">
              {caption}
            </span>
          </span>
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Ouvrir le média"
          >
            <ExternalLink className="size-4" />
          </a>
        </figcaption>
      </figure>
    )
  }

  if (media.type === 'VIDEO') {
    return (
      <div className="bg-card overflow-hidden rounded-lg border">
        <video
          controls
          preload="metadata"
          className="aspect-video w-full bg-black object-cover"
        >
          <source src={media.url} />
          Ton navigateur ne peut pas lire cette vidéo.
        </video>
        <div className="text-muted-foreground p-3 text-sm">{caption}</div>
      </div>
    )
  }

  return (
    <a
      href={media.url}
      target="_blank"
      rel="noreferrer"
      className="hover:bg-muted/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      <FileSearch className="text-muted-foreground size-4 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{media.url}</span>
        <span className="text-muted-foreground text-sm">{caption}</span>
      </span>
      <ExternalLink className="text-muted-foreground size-4 shrink-0" />
    </a>
  )
}

// ── Corrections form ───────────────────────────────────────────────────────────

export function PublicationCorrectionsWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const isPublicationLocked = Boolean(publicationId)

  const listQuery = useQuery({
    queryKey: publicationQueryKeys.list(),
    queryFn: () => listPublications(),
    enabled: !isPublicationLocked,
  })
  const options = listQuery.data?.items ?? []

  const [selectedPublicationId, setSelectedPublicationId] = useState('')
  // No implicit first-option default: keep the select in sync with the actual
  // state so the placeholder shows until the director explicitly picks one.
  const activePublicationId = publicationId ?? selectedPublicationId

  const targetQuery = useQuery({
    queryKey: publicationQueryKeys.detail(activePublicationId),
    queryFn: () => getPublication(activePublicationId),
    enabled: Boolean(activePublicationId),
  })
  const publication = targetQuery.data

  return (
    <AppLayout actor="director" page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Créer un correctif</CardTitle>
          <CardDescription>
            {publication
              ? 'Le correctif sera rattaché directement à cette publication.'
              : 'Sélectionne une publication pour créer un correctif.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isPublicationLocked && (
            <Label className="grid gap-2">
              Publication cible
              <select
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={activePublicationId}
                onChange={(event) =>
                  setSelectedPublicationId(event.target.value)
                }
              >
                <option value="">Sélectionnez une publication…</option>
                {options.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title ?? item.id}
                  </option>
                ))}
              </select>
            </Label>
          )}
          {publication ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaCell
                label="Publication cible"
                value={publication.title ?? publication.id}
              />
              <MetaCell
                label="Verdict"
                value={`${domainLabel(publication.finalVerdict)} · ${evidenceSummary(publication)}`}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4">
              <p className="font-medium">Aucune publication sélectionnée</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Choisis une publication dans la liste pour préparer le
                correctif.
              </p>
            </div>
          )}
          <Label className="grid gap-2">
            Correction
            <Textarea placeholder="Formuler le correctif à publier" />
          </Label>
          <Button className="w-fit" disabled={!publication}>
            <RotateCcw />
            Préparer le correctif
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
