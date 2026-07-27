import { Link } from '@tanstack/react-router'
import {
  ExternalLink,
  FileSearch,
  FileText,
  Inbox,
  Link2,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageLoader } from '@shared/ui/loader'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../../app-layout'
import { useResolvedActor } from '../../session-routing'
import { domainLabel } from '../../workspace-labels'
import {
  EmptyState,
  ErrorState,
  MetaCell,
  StatusBadge,
} from '../../workspace-ui'
import {
  JournalistProofList,
  MediaArtifact,
  SourceMediaReadRow,
  WatcherEvidenceCard,
} from '../investigations/media-cards'
import { OriginBadge, SubjectContextQuote } from '../investigations/primitives'
import {
  toJournalistProof,
  toSourceGroups,
  toWatcherEvidence,
} from '../investigations/to-dossier'
import {
  getPublicationDossier,
  publicationQueryKeys,
} from '@entities/publication/api'
import type { PublicationItem } from '@entities/publication/model'
import { evidenceSummary } from './format'
import { PublicationCredits } from './publication-credits'

export function PublicationDetailWorkspacePage({
  publicationId,
}: {
  publicationId?: string
}) {
  const { actor } = useResolvedActor('director')
  const canManage = actor === 'director' || actor === 'admin'

  const dossierQuery = useQuery({
    queryKey: publicationQueryKeys.dossier(publicationId ?? ''),
    queryFn: () => getPublicationDossier(publicationId as string),
    enabled: Boolean(publicationId),
  })
  const dossier = dossierQuery.data

  if (dossierQuery.isPending) {
    return (
      <AppLayout actor={actor} page="publications">
        <PageLoader label="Chargement de la publication…" />
      </AppLayout>
    )
  }

  if (dossierQuery.isError) {
    return (
      <AppLayout actor={actor} page="publications">
        <ErrorState error={dossierQuery.error} />
      </AppLayout>
    )
  }

  if (!dossier) return null

  // The same adapters the investigation workspaces use: the dossier endpoint
  // serves the identical rows minus every actor id.
  const sourceGroups = toSourceGroups(dossier.media)
  const journalistProof = toJournalistProof(dossier.media)
  const watcherEvidence = toWatcherEvidence(dossier.evidence)
  const sourceCount = sourceGroups.reduce(
    (total, group) => total + group.media.length,
    0,
  )

  return (
    <AppLayout actor={actor} page="publications">
      {/* Verdict card — what the reader came for, above everything else. */}
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {dossier.isCorrection
                  ? 'Correctif de publication'
                  : 'Publication vérifiée'}
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-balance">
                {dossier.title ?? 'Publication sans titre'}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={dossier.isCorrection ? 'secondary' : 'outline'}>
                {dossier.isCorrection ? 'Correctif' : 'Publication'}
              </Badge>
              {canManage && (
                <Button size="sm" asChild>
                  <Link
                    to="/publications/corrections"
                    search={{ publicationId: dossier.id }}
                  >
                    <RotateCcw />
                    Créer un correctif
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {dossier.subject ? (
            <SubjectContextQuote subject={dossier.subject} />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <MetaCell
              label="Verdict final"
              value={<StatusBadge status={dossier.finalVerdict} />}
            />
            <MetaCell label="Preuves" value={evidenceSummary(dossier)} />
            <MetaCell
              label="Publié le"
              value={new Date(dossier.publishedAt).toLocaleDateString('fr-FR')}
            />
          </div>
        </CardHeader>
      </Card>

      {/* The director's signed statement. Absent only on dossiers arbitrated
          before it became mandatory — those are shown as unsigned rather than
          attributed to a director who never wrote them. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Note de publication</CardTitle>
          <CardDescription>
            {dossier.publicationNotes
              ? 'Ce que la rédaction retient du dossier, et pourquoi elle l’assume.'
              : 'Ce dossier a été arbitré avant que la note signée ne devienne obligatoire.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dossier.publicationNotes ? (
            <blockquote className="border-primary/40 border-l-2 pl-4">
              <p className="text-sm leading-relaxed text-pretty whitespace-pre-line">
                {dossier.publicationNotes}
              </p>
              {dossier.credits.directorName && (
                <footer className="text-muted-foreground mt-3 text-xs">
                  — {dossier.credits.directorName}, directeur de publication
                </footer>
              )}
            </blockquote>
          ) : (
            <EmptyState
              icon={FileText}
              title="Aucune note signée"
              description="Cette publication est antérieure à l'obligation de note éditoriale. Aucune déclaration n'a été enregistrée à l'époque."
            />
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="source">
        <div className="overflow-x-auto pb-px">
          <TabsList className="tabular-nums">
            <TabsTrigger value="source">
              Médias du signalement ({sourceCount})
            </TabsTrigger>
            <TabsTrigger value="proof">
              Preuves journaliste ({journalistProof.length})
            </TabsTrigger>
            <TabsTrigger value="watchers">
              Contributions vigies ({watcherEvidence.length})
            </TabsTrigger>
            <TabsTrigger value="sources">
              Sources vérifiées ({dossier.verifiedLinks.length})
            </TabsTrigger>
            <TabsTrigger value="notes">Note d’enquête</TabsTrigger>
          </TabsList>
        </div>

        {/* SOURCE — every media of the originating report/subject, with the
            verdict and the journalistic justification attached to it. */}
        <TabsContent value="source" className="mt-4">
          {sourceCount > 0 ? (
            <div className="grid gap-6">
              {sourceGroups.map((group) => (
                <div key={group.origin} className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <OriginBadge origin={group.origin} />
                    <span className="text-muted-foreground text-sm">
                      {group.media.length} média
                      {group.media.length > 1 ? 's' : ''} vérifié
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
              description="Le signalement à l'origine de ce dossier ne comportait pas de média."
            />
          )}
        </TabsContent>

        <TabsContent value="proof" className="mt-4">
          {journalistProof.length > 0 ? (
            <JournalistProofList proofMedia={journalistProof} />
          ) : (
            <EmptyState
              icon={FileSearch}
              title="Aucune preuve journalistique"
              description="Le verdict s'appuie sur les médias du signalement et les contributions vigies."
            />
          )}
        </TabsContent>

        <TabsContent value="watchers" className="mt-4">
          {watcherEvidence.length > 0 ? (
            <div className="grid gap-3">
              {watcherEvidence.map((evidence) => (
                <WatcherEvidenceCard key={evidence.id} evidence={evidence} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Aucune contribution de vigie"
              description="Aucune vigie n'a documenté ce dossier avant sa publication."
            />
          )}
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <VerifiedEvidence publication={dossier} />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Note d’enquête du journaliste
              </CardTitle>
              <CardDescription>
                Le raisonnement qui a mené au verdict, tel qu’il a été soumis à
                l’arbitrage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dossier.investigationNotes.trim() ? (
                <p className="text-muted-foreground text-sm leading-relaxed text-pretty whitespace-pre-line">
                  {dossier.investigationNotes}
                </p>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Aucune note d’enquête"
                  description="Le dossier a été arbitré sans note écrite."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PublicationCredits credits={dossier.credits} />
    </AppLayout>
  )
}

/** The links and media the director attached to the publication itself. */
function VerifiedEvidence({ publication }: { publication: PublicationItem }) {
  const { verifiedLinks, verifiedMedia } = publication

  if (verifiedLinks.length === 0 && verifiedMedia.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="Aucune source d’appui attachée"
        description="La publication s'appuie sur le dossier d'enquête, sans source complémentaire."
      />
    )
  }

  return (
    <div className="grid gap-4">
      {verifiedLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Liens vérifiés</CardTitle>
            <CardDescription>
              Ouvrez les sources et comparez-les au verdict avant de partager.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {verifiedLinks.map((source) => (
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
      )}

      {verifiedMedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Médias vérifiés</CardTitle>
            <CardDescription>
              Médias retenus ou comparés pendant la vérification.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {verifiedMedia.map((media) => (
              <VerifiedMediaCard key={media.id} media={media} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function VerifiedMediaCard({
  media,
}: {
  media: PublicationItem['verifiedMedia'][number]
}) {
  const caption = media.authoritySourceName ?? domainLabel(media.type)

  return (
    <figure className="grid gap-2">
      <MediaArtifact url={media.url} type={media.type} title={caption} />
      <figcaption className="text-muted-foreground flex items-center gap-1.5 text-sm">
        {media.authoritySourceName ? (
          <ShieldCheck className="size-3.5 shrink-0" />
        ) : null}
        <span className="min-w-0 truncate">{caption}</span>
      </figcaption>
    </figure>
  )
}
