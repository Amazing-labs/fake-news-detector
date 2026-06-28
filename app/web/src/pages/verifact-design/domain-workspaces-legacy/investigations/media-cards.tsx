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
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
import { downloadFromUrl } from '@shared/lib/download'
import { Card, CardContent, CardHeader } from '@shared/ui/shadcn/card'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
import { domainLabel } from '../../workspace-labels'
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
          Categorie
          <CategorySelect value={category} onChange={setCategory} />
        </Label>
        <Label className="grid gap-1.5 text-sm">
          Fiabilite
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
          placeholder="Pourquoi ce media est-il fiable ou non ?"
        />
      </Label>
      {error ? (
        <p className="text-xs text-red-400">{toApiErrorMessage(error)}</p>
      ) : null}
      <Button
        size="sm"
        className="w-fit"
        disabled={!canSave || isPending}
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
      <Download className="size-4" />
      {loading ? 'Telechargement…' : label}
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

function MediaArtifact({
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
          title="Ouvrir en plein ecran"
        >
          <img src={href} alt={title} className="size-16 object-cover" />
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
          title="Ouvrir en plein ecran"
        >
          <img
            src={href}
            alt={title}
            className="max-h-56 w-full object-cover"
          />
        </a>
        <DownloadButton href={href} label="Telecharger l'image" />
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
            Ouvrir la video
          </a>
        </video>
        <DownloadButton href={href} label="Telecharger la video" />
      </div>
    )
  }

  if (type === 'AUDIO') {
    return <DownloadButton href={href} label="Ecouter / Telecharger" />
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

  return <DownloadButton href={href} label="Telecharger" />
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
            {isClassified && (
              <Badge className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                Classe
              </Badge>
            )}
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
            {media.reliability && (
              <Badge variant="secondary">
                {domainLabel(media.reliability)}
              </Badge>
            )}
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
          <span className="text-sm font-medium">Media {index + 1}</span>
        </div>
        {isClassified && (
          <Badge className="border-green-200 bg-green-50 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            Classe
          </Badge>
        )}
      </div>
      <MediaArtifact
        url={media.url}
        type={media.type}
        title={`Media ${index + 1}`}
      />
      <MediaClassificationForm
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

export function WatcherEvidenceCard({
  evidence,
  withClassification,
  investigationId,
}: {
  evidence: WatcherEvidenceItem
  withClassification: boolean
  investigationId: string
}) {
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
                  <Badge className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                    Tous classés
                  </Badge>
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
            <div className="border-l-2 pl-3">
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Observation
              </p>
              <p className="text-sm">{evidence.note}</p>
            </div>
          )}

          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Médias ({evidence.media.length})
          </p>

          {withClassification ? (
            evidence.media.map((m, i) => (
              <EvidenceMediaClassificationRow
                key={m.id}
                media={m}
                index={i}
                investigationId={investigationId}
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
                          Media {i + 1}
                        </span>
                      </div>
                      {classified && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {domainLabel(m.category!)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {domainLabel(m.reliability!)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <MediaArtifact
                      url={m.url}
                      type={m.type}
                      title={`Media ${i + 1}`}
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
