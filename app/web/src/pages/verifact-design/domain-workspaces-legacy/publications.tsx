import { Link } from '@tanstack/react-router'
import {
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  Link2,
  Play,
  RotateCcw,
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
import { publications } from '../workspace-mocks'
import {
  listPublications,
  publicationQueryKeys,
} from '@entities/publication/api'
import type { PublicationItem } from '@entities/publication/model'
import { slugifyLabel } from './utils'

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

export function PublicationDetailWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const publication = publications.find(
    (item) => slugifyLabel(item.title) === publicationId,
  )
  const { actor } = useResolvedActor('director')
  const canManage = actor === 'director' || actor === 'admin'

  if (!publication) return null

  const linkCount = publication.verifiedLinks.length
  const mediaCount = publication.verifiedMedia.length
  const docCount = publication.finalDocuments.length

  return (
    <AppLayout actor={actor} page="publications">
      {/* Header card — all roles */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold">{publication.title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {actor === 'citizen'
                  ? 'Synthèse publique du verdict et des preuves disponibles.'
                  : 'Verdict final, preuves conservées et type de publication.'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant={
                  publication.type === 'Correctif' ? 'secondary' : 'outline'
                }
              >
                {domainLabel(publication.type)}
              </Badge>
              {canManage && (
                <Button size="sm" asChild>
                  <Link
                    to="/publications/corrections"
                    search={{ publicationId: publicationId ?? undefined }}
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
              value={domainLabel(publication.verdict)}
            />
            <MetaCell label="Preuves" value={publication.evidence} />
          </div>
        </CardHeader>
      </Card>

      {/* Citizen: rich tabbed view */}
      {actor === 'citizen' ? (
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Synthèse</TabsTrigger>
            <TabsTrigger value="sources">
              Sources ({linkCount + docCount})
            </TabsTrigger>
            <TabsTrigger value="media">Médias ({mediaCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Résumé de l'enquête
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {publication.summary}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm font-medium">Pour aller plus loin</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Si une information semble incomplète, tu peux créer un
                    nouveau signalement depuis la page Signalements. La
                    rédaction l'examinera comme une nouvelle alerte.
                  </p>
                  <Button className="mt-4 w-fit" variant="outline" asChild>
                    <Link to="/reports/create">Faire un signalement</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <div className="grid gap-4">
              {linkCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Liens vérifiés</CardTitle>
                    <CardDescription>
                      Ouvre les sources et compare-les avec le résumé avant de
                      partager la publication.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {publication.verifiedLinks.map((source) => (
                      <a
                        key={source.label}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <Link2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">
                            {source.label}
                          </span>
                          <span className="text-muted-foreground mt-1 block text-sm">
                            {source.description}
                          </span>
                        </span>
                        <ExternalLink className="text-muted-foreground size-4 shrink-0" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {docCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Documents finaux
                    </CardTitle>
                    <CardDescription>
                      Pièces conservées avec la publication finale.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {publication.finalDocuments.map((document) => (
                      <a
                        key={document.name}
                        href={document.url}
                        download
                        className="hover:bg-muted/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                      >
                        <FileText className="text-muted-foreground size-4 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {document.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {document.type} / {document.size}
                          </span>
                        </span>
                        <Download className="text-muted-foreground size-4 shrink-0" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {linkCount === 0 && docCount === 0 && (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="font-medium">Aucune source attachée</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Les sources seront disponibles une fois la publication
                    complète.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Médias vérifiés</CardTitle>
                <CardDescription>
                  Médias retenus ou comparés pendant la vérification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mediaCount > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {publication.verifiedMedia.map((media) => {
                      if (media.type === 'Image') {
                        return (
                          <figure
                            key={media.name}
                            className="bg-card overflow-hidden rounded-lg border"
                          >
                            <img
                              src={media.imageUrl}
                              alt={media.alt ?? media.name}
                              className="aspect-video w-full object-cover"
                              loading="lazy"
                            />
                            <figcaption className="flex items-center justify-between gap-3 p-3">
                              <span>
                                <span className="block font-medium">
                                  {media.name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  Image de référence Unsplash
                                </span>
                              </span>
                              <a
                                href={media.url}
                                className="text-muted-foreground hover:text-foreground shrink-0"
                                aria-label={`Ouvrir ${media.name}`}
                              >
                                <ExternalLink className="size-4" />
                              </a>
                            </figcaption>
                          </figure>
                        )
                      }

                      if (media.type === 'Video') {
                        return (
                          <div
                            key={media.name}
                            className="bg-card overflow-hidden rounded-lg border"
                          >
                            <video
                              controls
                              preload="metadata"
                              poster={media.posterUrl}
                              className="aspect-video w-full bg-black object-cover"
                            >
                              <source src={media.videoUrl} type="video/mp4" />
                              Ton navigateur ne peut pas lire cette vidéo.
                            </video>
                            <div className="flex items-center justify-between gap-3 p-3">
                              <span>
                                <span className="block font-medium">
                                  {media.name}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  Extrait comparé pendant la vérification
                                </span>
                              </span>
                              <Play className="text-muted-foreground size-4 shrink-0" />
                            </div>
                          </div>
                        )
                      }

                      return (
                        <a
                          key={media.name}
                          href={media.url}
                          className="hover:bg-muted/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <FileSearch className="text-muted-foreground size-4 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {media.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {media.type}
                            </span>
                          </span>
                          <ExternalLink className="text-muted-foreground size-4 shrink-0" />
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="font-medium">Aucun média joint</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Les médias seront disponibles une fois la publication
                      complète.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Director/admin: trace éditoriale */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trace éditoriale</CardTitle>
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

// ── Corrections form ───────────────────────────────────────────────────────────

export function PublicationCorrectionsWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const [selectedPublicationId, setSelectedPublicationId] = useState(
    publicationId ?? slugifyLabel(publications[0]?.title ?? ''),
  )
  const activePublicationId = publicationId ?? selectedPublicationId
  const publication = publications.find(
    (item) => slugifyLabel(item.title) === activePublicationId,
  )
  const isPublicationLocked = Boolean(publicationId)

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
                {publications.map((item) => {
                  const id = slugifyLabel(item.title)
                  return (
                    <option key={id} value={id}>
                      {item.title}
                    </option>
                  )
                })}
              </select>
            </Label>
          )}
          {publication ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaCell label="Publication cible" value={publication.title} />
              <MetaCell
                label="Verdict"
                value={`${domainLabel(publication.verdict)} · ${publication.evidence}`}
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
