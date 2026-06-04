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
import { cn } from '../../../shared/lib/utils'
import { Badge } from '../../../shared/ui/shadcn/badge'
import { Button } from '../../../shared/ui/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/ui/shadcn/card'
import { Label } from '../../../shared/ui/shadcn/label'
import { Textarea } from '../../../shared/ui/shadcn/textarea'
import { AppLayout } from '../app-layout'
import { useResolvedActor } from '../session-routing'
import { domainLabel } from '../workspace-labels'
import { publications } from '../workspace-mocks'
import { slugifyLabel } from './utils'

export function PublicationsWorkspacePage() {
  const { actor } = useResolvedActor('director')
  const canManagePublications = actor === 'director' || actor === 'admin'

  return (
    <AppLayout actor={actor} page="publications">
      <Card>
        <CardHeader>
          <CardTitle>Publications et correctifs</CardTitle>
          <CardDescription>
            Chaque publication conserve son verdict final et ses preuves.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {publications.map((item) => {
            const publicationId = slugifyLabel(item.title)

            return (
              <div
                key={item.title}
                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Verdict: {domainLabel(item.verdict)} / {item.evidence}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Badge
                    variant={
                      item.type === 'Correctif' ? 'secondary' : 'outline'
                    }
                  >
                    {domainLabel(item.type)}
                  </Badge>
                  {canManagePublications ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        to="/publications/corrections"
                        search={{ publicationId }}
                      >
                        <RotateCcw />
                        Correctif
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted size-8 rounded-full transition-colors"
                    asChild
                  >
                    <Link
                      to="/publications/$publicationId"
                      params={{ publicationId }}
                      aria-label={`Voir le detail de ${item.title}`}
                    >
                      <ExternalLink />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </AppLayout>
  )
}

export function PublicationDetailWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const publication =
    publications.find((item) => slugifyLabel(item.title) === publicationId) ??
    publications[0]
  const { actor } = useResolvedActor('director')
  const canManagePublication = actor === 'director' || actor === 'admin'

  if (!publication) {
    return null
  }

  return (
    <AppLayout actor={actor} page="publications">
      <div
        className={cn(
          'grid gap-6',
          canManagePublication && 'lg:grid-cols-[1fr_320px]',
        )}
      >
        <Card>
          <CardHeader>
            <CardTitle>{publication.title}</CardTitle>
            <CardDescription>
              {actor === 'citizen'
                ? 'Synthèse publique du verdict et des preuves disponibles.'
                : 'Verdict final, preuves conservees et type de publication.'}
            </CardDescription>
            <CardAction>
              <Badge
                variant={
                  publication.type === 'Correctif' ? 'secondary' : 'outline'
                }
              >
                {domainLabel(publication.type)}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Verdict
                </p>
                <p className="mt-1 font-medium">
                  {domainLabel(publication.verdict)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  Preuves
                </p>
                <p className="mt-1 font-medium">{publication.evidence}</p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">
                {actor === 'citizen'
                  ? "Résumé de l'enquête"
                  : 'Trace editoriale'}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {actor === 'citizen'
                  ? publication.summary
                  : 'La publication garde le verdict, les sources utilisées et les corrections rattachées pour rester consultable par la rédaction.'}
              </p>
            </div>
            {actor === 'citizen' ? (
              <>
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">Liens verifies</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Ouvre les sources et compare-les avec le resume avant de
                        partager la publication.
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {publication.verifiedLinks.length} lien
                      {publication.verifiedLinks.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {publication.verifiedLinks.length ? (
                      publication.verifiedLinks.map((source) => (
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
                      ))
                    ) : (
                      <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                        Aucun lien public n'a ete attache a cette publication.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="font-medium">Documents finaux</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Pièces conservées avec la publication finale.
                    </p>
                    <div className="mt-4 grid gap-3">
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
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="font-medium">Médias vérifiés</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Médias retenus ou comparés pendant la vérification.
                    </p>
                    <div className="mt-4 grid gap-3">
                      {publication.verifiedMedia.length ? (
                        publication.verifiedMedia.map((media) => {
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
                                      Image de reference Unsplash
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
                                  <source
                                    src={media.videoUrl}
                                    type="video/mp4"
                                  />
                                  Ton navigateur ne peut pas lire cette video.
                                </video>
                                <div className="flex items-center justify-between gap-3 p-3">
                                  <span>
                                    <span className="block font-medium">
                                      {media.name}
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      Extrait compare pendant la verification
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
                        })
                      ) : (
                        <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                          Aucun média final n'a été joint à cette publication.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {actor === 'citizen' ? (
              <div className="rounded-lg border p-4">
                <p className="font-medium">Pour aller plus loin</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Si une information semble incomplete, tu peux creer un nouveau
                  signalement depuis la page Signalements. La rédaction
                  l'examinera comme une nouvelle alerte.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        {canManagePublication ? (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Corriger la publication sans modifier le verdict original.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild>
                <Link
                  to="/publications/corrections"
                  search={{ publicationId: publicationId ?? undefined }}
                >
                  <RotateCcw />
                  Créer un correctif
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/publications/list">Retour aux publications</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  )
}

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
          {!isPublicationLocked ? (
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
          ) : null}
          {publication ? (
            <div className="rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                Publication cible
              </p>
              <p className="mt-1 font-medium">{publication.title}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Verdict: {domainLabel(publication.verdict)} /{' '}
                {publication.evidence}
              </p>
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
