import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@shared/lib/utils'
import { Badge } from '@shared/ui/shadcn/badge'
import { Button } from '@shared/ui/shadcn/button'
import { Card, CardContent } from '@shared/ui/shadcn/card'
import { Textarea } from '@shared/ui/shadcn/textarea'
import { domainLabel } from '../../workspace-labels'
import { EmptyState, StatusBadge } from '../../workspace-ui'
import {
  CATEGORY_OPTIONS,
  MEDIA_TYPE_ICONS,
  ORIGIN_CONFIG,
  RELIABILITY_OPTIONS,
  SELECT_CLASS,
} from './config'
import type { Dossier } from './types'

export function OriginBadge({ origin }: { origin: string }) {
  const cfg = ORIGIN_CONFIG[origin as keyof typeof ORIGIN_CONFIG]
  if (!cfg)
    return (
      <Badge variant="outline" className="text-xs">
        {domainLabel(origin)}
      </Badge>
    )
  const { Icon, badgeClass } = cfg
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        badgeClass,
      )}
    >
      <Icon className="size-3" />
      {domainLabel(origin)}
    </span>
  )
}

export function MediaTypeIcon({ type }: { type: string }) {
  const Icon = MEDIA_TYPE_ICONS[type] ?? FileText
  return <Icon className="text-muted-foreground size-4 shrink-0" />
}

export function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs font-medium uppercase">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

// Inbox-subject content the investigation was opened on, elevated into a quoted
// italic block. Shared by the director view and the DossierHeader (journalist /
// watcher) so every role reads the source context the same way.
export function SubjectContextQuote({ subject }: { subject: string }) {
  return (
    <blockquote className="border-primary/50 bg-muted/40 rounded-r-lg border-l-2 px-4 py-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Contexte du sujet
      </p>
      <p className="mt-1.5 text-sm leading-relaxed italic">{subject}</p>
    </blockquote>
  )
}

export function DossierHeader({
  dossier,
  action,
}: {
  dossier: Pick<Dossier, 'title' | 'subject' | 'status'>
  action?: ReactNode
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="min-w-0 text-lg leading-snug font-semibold">
          {dossier.title}
        </h1>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={dossier.status} />
          {action}
        </div>
      </div>
      <SubjectContextQuote subject={dossier.subject} />
    </div>
  )
}

export function CategorySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={SELECT_CLASS}
    >
      <option value="" disabled>
        Catégorie
      </option>
      {CATEGORY_OPTIONS.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}

export function ReliabilitySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={SELECT_CLASS}
    >
      <option value="" disabled>
        Fiabilité
      </option>
      {RELIABILITY_OPTIONS.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}

export function NotesBlock({
  notes,
  readOnly,
}: {
  notes: string
  readOnly: boolean
}) {
  return (
    <Card>
      <CardContent>
        {readOnly ? (
          notes.trim() ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {notes}
            </p>
          ) : (
            <EmptyState
              icon={FileText}
              title="Aucune note d'enquête"
              description="Le journaliste n'a pas encore rédigé de note sur ce dossier."
            />
          )
        ) : (
          <div className="grid gap-3">
            <Textarea defaultValue={notes} rows={5} className="resize-none" />
            <Button size="sm" className="w-fit">
              Enregistrer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
