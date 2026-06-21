import { ExternalLink } from 'lucide-react'
import { Badge } from '../../../../shared/ui/shadcn/badge'
import { Button } from '../../../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '../../../../shared/ui/shadcn/card'
import { Label } from '../../../../shared/ui/shadcn/label'
import { Textarea } from '../../../../shared/ui/shadcn/textarea'
import { domainLabel } from '../../workspace-labels'
import {
  CategorySelect,
  MediaTypeIcon,
  OriginBadge,
  ReliabilitySelect,
} from './primitives'
import type { JournalistProofMedia, SourceMedia, WatcherEvidenceItem } from './types'

// ── Source media card (journalist classifies) ──────────────────────────────────

export function SourceMediaCard({ media }: { media: SourceMedia }) {
  const isClassified = Boolean(
    media.category && media.reliability && media.justification,
  )
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <MediaTypeIcon type={media.type} />
            <span className="truncate font-medium">{media.title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <OriginBadge origin={media.origin} />
            {isClassified && (
              <Badge className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                ✓ Classé
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Label className="grid gap-1.5 text-sm">
            Catégorie
            <CategorySelect defaultValue={media.category} />
          </Label>
          <Label className="grid gap-1.5 text-sm">
            Fiabilité
            <ReliabilitySelect defaultValue={media.reliability} />
          </Label>
        </div>
        <Label className="grid gap-1.5 text-sm">
          Justification
          <Textarea
            defaultValue={media.justification}
            rows={2}
            className="resize-none"
          />
        </Label>
        <Button size="sm" variant="outline" className="w-fit">
          {isClassified ? 'Mettre à jour' : 'Enregistrer la classification'}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Source media read-only row (director view) ─────────────────────────────────

export function SourceMediaReadRow({ media }: { media: SourceMedia }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <MediaTypeIcon type={media.type} />
            <p className="truncate font-medium">{media.title}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Badge variant="outline">{domainLabel(media.category)}</Badge>
            <Badge variant="secondary">{domainLabel(media.reliability)}</Badge>
          </div>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          {media.justification}
        </p>
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
  return (
    <div className="grid gap-3">
      {proofMedia.map((media) => (
        <Card key={media.title}>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <MediaTypeIcon type={media.type} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{media.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {domainLabel(media.sourceType)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <OriginBadge origin="JOURNALIST_PROOF" />
                <Badge variant="outline">{media.authoritySource}</Badge>
                {media.url && (
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Ouvrir la source"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Watcher evidence card ──────────────────────────────────────────────────────

export function WatcherEvidenceCard({
  evidence,
  withClassification,
}: {
  evidence: WatcherEvidenceItem
  withClassification: boolean
}) {
  const isClassified = Boolean(evidence.reliability)
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <OriginBadge origin="WATCHER" />
              <span className="font-medium">{evidence.title}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {evidence.watcher} · {evidence.media}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {evidence.category && (
              <Badge variant="outline">
                {domainLabel(evidence.category)}
              </Badge>
            )}
            {evidence.reliability && (
              <Badge variant="secondary">
                {domainLabel(evidence.reliability)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-muted-foreground text-sm">{evidence.note}</p>
        {withClassification && (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <Label className="grid gap-1.5 text-sm">
                Catégorie
                <CategorySelect defaultValue={evidence.category} />
              </Label>
              <Label className="grid gap-1.5 text-sm">
                Fiabilité
                <ReliabilitySelect defaultValue={evidence.reliability} />
              </Label>
            </div>
            <Label className="grid gap-1.5 text-sm">
              Justification
              <Textarea
                defaultValue={evidence.note}
                rows={2}
                className="resize-none"
              />
            </Label>
            <Button size="sm" variant="outline" className="w-fit">
              {isClassified ? 'Reclasser' : 'Classer la contribution'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
