import { ChevronDown, Download, ExternalLink, Play } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  classifyInvestigationSourceMedia,
  classifyWatcherEvidenceMedia,
  investigationQueryKeys,
  type MediaClassificationInput,
} from '@entities/investigation/api'
import type { MediaCategory, Verdict } from '@entities/investigation/schemas'
import { toApiErrorMessage } from '@shared/api/http'
import { cn } from '@shared/lib/utils'
import { Spinner } from '@shared/ui/loader'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
import { downloadFromUrl } from '@shared/lib/download'
import { Card, CardContent, CardHeader } from '@shared/ui/shadcn/card'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
import { domainLabel } from '../../workspace-labels'
import { StatusBadge } from '../../workspace-ui'
import {
  CategorySelect,
  MediaTypeIcon,
  OriginBadge,
  ReliabilitySelect,
} from './primitives'
import type {
  JournalistProofMedia,
  SourceMedia,
  WatcherEvidenceItem,
  WatcherEvidenceMedia,
} from './types'

// Carries the same emerald "done" tone as a resolved StatusBadge, so a
// classified media reads like any other finished thing in the product.
function ClassifiedBadge({ children }: { children: string }) {
  return (
    <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
      {children}
    </Badge>
  )
}

// Shared classification form (category + reliability + justification) used by
// the journalist to classify source media and watcher evidence media.
function MediaClassificationForm({
  initial,
  isPending,
  error,
  onSave,
}: {
  initial: { category: string; reliability: string; justification: string }
  isPending: boolean
  error: unknown
  onSave: (input: MediaClassificationInput) => void
}) {
  const [category, setCategory] = useState(initial.category)
  const [reliability, setReliability] = useState(initial.reliability)
  const [justification, setJustification] = useState(initial.justification)
  const canSave =
    category !== '' && reliability !== '' && justification.trim() !== ''

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Label className="grid gap-1.5 text-sm">
          Catégorie
          <CategorySelect value={category} onChange={setCategory} />
        </Label>
        <Label className="grid gap-1.5 text-sm">
          Fiabilité
          <ReliabilitySelect value={reliability} onChange={setReliability} />
        </Label>
      </div>
      <Label className="grid gap-1.5 text-sm">
        Justification
        <Textarea
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          rows={2}
          className="resize-none"
          placeholder="Pourquoi ce média est-il fiable ou non ?"
        />
      </Label>
      {error ? (
        <p className="text-destructive text-sm">{toApiErrorMessage(error)}</p>
      ) : null}
      <Button
        size="sm"
        className="w-fit"
        disabled={!canSave}
        loading={isPending}
        onClick={() =>
          onSave({
            category: category as MediaCategory,
            reliability: reliability as Verdict,
            justification: justification.trim(),
          })
        }
      >
        {isPending ? 'Enregistrement…' : 'Enregistrer la classification'}
      </Button>
    </div>
  )
}

function DownloadButton({ href, label }: { href: string; label: string }) {
  const [loading, setLoading] = useState(false)
  const filename = (() => {
    try {
      const ext = new URL(href).pathname.split('.').pop() ?? ''
      return ext && ext.length <= 6 ? `media.${ext}` : 'media'
    } catch {
      return 'media'
    }
  })()

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-fit"
      disabled={loading}
      onClick={() => {
        setLoading(true)
        downloadFromUrl(href, filename).finally(() => setLoading(false))
      }}
    >
      {loading ? <Spinner /> : <Download className="size-4" />}
      {loading ? 'Téléchargement…' : label}
    </Button>
  )
}

function safeHref(url: string): string | undefined {
  try {
    const { protocol } = new URL(url, window.location.href)
    return protocol === 'https:' || protocol === 'http:' ? url : undefined
  } catch {
    return undefined
  }
}

// Renders any media by type — inline for image/video, an action button
// otherwise — with the download affordance the product uses everywhere.
export function MediaArtifact({
  url,
  type,
  title,
  size = 'md',
}: {
  url: string
  type: string
  title: string
  size?: 'sm' | 'md'
}) {
  const href = safeHref(url)
  if (!href) return null

  if (type === 'IMAGE') {
    if (size === 'sm') {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border"
          title="Ouvrir en plein écran"
        >
          <img
            src={href}
            alt={title}
            loading="lazy"
            className="size-16 object-cover"
          />
        </a>
      )
    }
    return (
      <div className="grid gap-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-lg border"
          title="Ouvrir en plein écran"
        >
          <img
            src={href}
            alt={title}
            loading="lazy"
            className="max-h-56 w-full object-cover"
          />
        </a>
        <DownloadButton href={href} label="Télécharger l'image" />
      </div>
    )
  }

  if (type === 'VIDEO') {
    if (size === 'sm') {
      return (
        <Button size="sm" variant="outline" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Play className="size-4" />
            Lire
          </a>
        </Button>
      )
    }
    return (
      <div className="grid gap-2">
        <video
          src={href}
          controls
          preload="metadata"
          className="max-h-56 w-full rounded-lg border bg-black"
        >
          <a href={href} target="_blank" rel="noopener noreferrer">
            Ouvrir la vidéo
          </a>
        </video>
        <DownloadButton href={href} label="Télécharger la vidéo" />
      </div>
    )
  }

  if (type === 'AUDIO') {
    return <DownloadButton href={href} label="Écouter / Télécharger" />
  }

  if (type === 'LINK') {
    return (
      <Button size="sm" variant="outline" asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-4" />
          Ouvrir le lien
        </a>
      </Button>
    )
  }

  return <DownloadButton href={href} label="Télécharger" />
}

// ── Source media card (journalist classifies) ──────────────────────────────────

export function SourceMediaCard({
  media,
  investigationId,
}: {
  media: SourceMedia
  investigationId: string
}) {
  const queryClient = useQueryClient()
  const isClassified = Boolean(
    media.category && media.reliability && media.justification,
  )
  const mutation = useMutation({
    mutationFn: (input: MediaClassificationInput) =>
      classifyInvestigationSourceMedia(investigationId, media.id, input),
    onSuccess: () => {
      toast.success('Classification enregistrée.')
      void queryClient.invalidateQueries({
        queryKey: investigationQueryKeys.sourceMedia(investigationId),
      })
    },
  })

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <MediaTypeIcon type={media.type} />
            <span className="min-w-0 truncate font-medium">
              {domainLabel(media.type)}
            </span>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <OriginBadge origin={media.origin} />
            {isClassified && <ClassifiedBadge>Classé</ClassifiedBadge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {media.url && (
          <MediaArtifact
            url={media.url}
            type={media.type}
            title={domainLabel(media.type)}
          />
        )}
        <MediaClassificationForm
          key={`${media.id}-${media.category ?? ''}-${media.reliability ?? ''}`}
          initial={{
            category: media.category ?? '',
            reliability: media.reliability ?? '',
            justification: media.justification ?? '',
          }}
          isPending={mutation.isPending}
          error={mutation.error}
          onSave={(input) => mutation.mutate(input)}
        />
      </CardContent>
    </Card>
  )
}

// ── Source media read-only row (director / watcher view) ───────────────────────

export function SourceMediaReadRow({ media }: { media: SourceMedia }) {
  const showInline =
    media.url && (media.type === 'IMAGE' || media.type === 'VIDEO')
  const showButton =
    media.url && media.type !== 'IMAGE' && media.type !== 'VIDEO'

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-3 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MediaTypeIcon type={media.type} />
            <p className="min-w-0 truncate font-medium">
              {domainLabel(media.type)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {media.category && (
              <Badge variant="outline">{domainLabel(media.category)}</Badge>
            )}
            {media.reliability && <StatusBadge status={media.reliability} />}
            {showButton && (
              <MediaArtifact
                url={media.url!}
                type={media.type}
                title={domainLabel(media.type)}
                size="sm"
              />
            )}
          </div>
        </div>
        {showInline && (
          <MediaArtifact
            url={media.url!}
            type={media.type}
            title={domainLabel(media.type)}
          />
        )}
        {media.justification && (
          <p className="text-muted-foreground text-sm">{media.justification}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Journalist proof list (read-only) ─────────────────────────────────────────

export function JournalistProofList({
  proofMedia,
}: {
  proofMedia: JournalistProofMedia[]
}) {
  if (!proofMedia.length) return null
  const showInlineTypes = ['IMAGE', 'VIDEO']

  return (
    <div className="grid gap-3">
      {proofMedia.map((media) => {
        const showInline = media.url && showInlineTypes.includes(media.type)
        const showButton = media.url && !showInlineTypes.includes(media.type)

        const label = media.authoritySource ?? domainLabel(media.type)

        return (
          <Card key={media.id} className="overflow-hidden">
            <CardContent className="grid gap-3 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <MediaTypeIcon type={media.type} />
                  <div className="min-w-0">
                    <p className="min-w-0 truncate font-medium">{label}</p>
                    {media.sourceType && (
                      <p className="text-muted-foreground text-xs">
                        {domainLabel(media.sourceType)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <OriginBadge origin="JOURNALIST_PROOF" />
                  {media.authoritySource && (
                    <Badge variant="outline">{media.authoritySource}</Badge>
                  )}
                  {showButton && (
                    <MediaArtifact
                      url={media.url!}
                      type={media.type}
                      title={label}
                      size="sm"
                    />
                  )}
                </div>
              </div>
              {showInline && (
                <MediaArtifact
                  url={media.url!}
                  type={media.type}
                  title={label}
                />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ── Per-media classification form (journalist, inside watcher evidence) ────────

function EvidenceMediaClassificationRow({
  media,
  index,
  investigationId,
  evidenceId,
}: {
  media: WatcherEvidenceMedia
  index: number
  investigationId: string
  evidenceId: string
}) {
  const queryClient = useQueryClient()
  const isClassified = Boolean(
    media.category && media.reliability && media.justification,
  )
  const mutation = useMutation({
    mutationFn: (input: MediaClassificationInput) =>
      classifyWatcherEvidenceMedia(
        investigationId,
        evidenceId,
        media.id,
        input,
      ),
    onSuccess: () => {
      toast.success('Classification enregistrée.')
      void queryClient.invalidateQueries({
        queryKey: investigationQueryKeys.evidence(investigationId),
      })
    },
  })

  return (
    <div className="grid gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MediaTypeIcon type={media.type} />
          <span className="text-sm font-medium">Média {index + 1}</span>
        </div>
        {isClassified && <ClassifiedBadge>Classé</ClassifiedBadge>}
      </div>
      <MediaArtifact
        url={media.url}
        type={media.type}
        title={`Média ${index + 1}`}
      />
      <MediaClassificationForm
        key={`${media.id}-${media.category ?? ''}-${media.reliability ?? ''}`}
        initial={{
          category: media.category ?? '',
          reliability: media.reliability ?? '',
          justification: media.justification ?? '',
        }}
        isPending={mutation.isPending}
        error={mutation.error}
        onSave={(input) => mutation.mutate(input)}
      />
    </div>
  )
}

// ── Watcher evidence card ──────────────────────────────────────────────────────

// `investigationId` is only ever used to address the classification mutation,
// so the read-only variant does not ask for one.
type WatcherEvidenceCardProps = { evidence: WatcherEvidenceItem } & (
  | { withClassification: true; investigationId: string }
  | { withClassification?: false }
)

export function WatcherEvidenceCard(props: WatcherEvidenceCardProps) {
  const { evidence, withClassification } = props
  const [isOpen, setIsOpen] = useState(false)
  const classifiedCount = evidence.media.filter(
    (m) => m.category && m.reliability && m.justification,
  ).length
  const allClassified =
    evidence.media.length > 0 && classifiedCount === evidence.media.length

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="w-full text-left"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="grid min-w-0 gap-1">
              <div className="flex items-center gap-2">
                <OriginBadge origin="WATCHER" />
                <span className="text-muted-foreground text-xs">
                  {evidence.watcher ?? 'Vigie'}
                </span>
              </div>
              <p className="text-base leading-snug font-semibold">
                {evidence.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {withClassification &&
                (allClassified ? (
                  <ClassifiedBadge>Tous classés</ClassifiedBadge>
                ) : (
                  <Badge variant="outline">
                    {classifiedCount}/{evidence.media.length} classé
                    {classifiedCount > 1 ? 's' : ''}
                  </Badge>
                ))}
              <ChevronDown
                className={cn(
                  'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </div>
          </div>
        </CardHeader>
      </button>

      {isOpen && (
        <CardContent className="grid gap-4 pt-0">
          {evidence.note && (
            <blockquote className="bg-muted/40 rounded-lg px-4 py-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Observation
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{evidence.note}</p>
            </blockquote>
          )}

          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Médias ({evidence.media.length})
          </p>

          {props.withClassification ? (
            evidence.media.map((m, i) => (
              <EvidenceMediaClassificationRow
                key={m.id}
                media={m}
                index={i}
                investigationId={props.investigationId}
                evidenceId={evidence.id}
              />
            ))
          ) : (
            <div className="grid gap-3">
              {evidence.media.map((m, i) => {
                const classified =
                  m.category && m.reliability && m.justification
                return (
                  <div key={i} className="grid gap-2 rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MediaTypeIcon type={m.type} />
                        <span className="text-sm font-medium">
                          Média {i + 1}
                        </span>
                      </div>
                      {classified && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {domainLabel(m.category!)}
                          </Badge>
                          <StatusBadge status={m.reliability!} />
                        </div>
                      )}
                    </div>
                    <MediaArtifact
                      url={m.url}
                      type={m.type}
                      title={`Média ${i + 1}`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
