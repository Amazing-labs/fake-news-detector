import { FileText, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ActionState } from '@entities/investigation/policy'
import { Badge } from '@shared/ui/shadcn/badge'
import { Card, CardContent } from '@shared/ui/shadcn/card'
import { domainLabel } from '../../workspace-labels'
import { EmptyState, MetaCell, StatusBadge } from '../../workspace-ui'

export { MetaCell }
import {
  CATEGORY_FALLBACK,
  CATEGORY_GROUPS,
  MEDIA_TYPE_ICONS,
  ORIGIN_CONFIG,
  RELIABILITY_OPTIONS,
  SELECT_CLASS,
} from './config'
import type { Dossier } from './types'

export function OriginBadge({ origin }: { origin: string }) {
  const Icon = ORIGIN_CONFIG[origin as keyof typeof ORIGIN_CONFIG]?.Icon

  return (
    <Badge variant="outline" className="h-6 gap-1 rounded-full px-2.5 text-xs">
      {Icon ? <Icon className="size-3" /> : null}
      {domainLabel(origin)}
    </Badge>
  )
}

export function MediaTypeIcon({ type }: { type: string }) {
  const Icon = MEDIA_TYPE_ICONS[type] ?? FileText
  return <Icon className="text-muted-foreground size-4 shrink-0" />
}

// Inbox-subject content the investigation was opened on, elevated into a quoted
// italic block. Shared by the director view and the DossierHeader (journalist /
// watcher) so every role reads the source context the same way.
export function SubjectContextQuote({ subject }: { subject: string }) {
  return (
    <blockquote className="bg-muted/40 rounded-lg px-4 py-3">
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
  placeholder = 'Catégorie',
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={SELECT_CLASS}
      disabled={disabled}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {CATEGORY_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </optgroup>
      ))}
      <option value={CATEGORY_FALLBACK[0]}>{CATEGORY_FALLBACK[1]}</option>
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

// A disabled control swallows pointer events and leaves the tab order, so the
// explanation cannot live on the control itself: `title` serves pointer users
// and the visually-hidden copy keeps it reachable for assistive tech.
export function ActionGuard({
  action,
  children,
}: {
  action: ActionState
  children: ReactNode
}) {
  if (action.enabled) return children
  return (
    <span className="inline-flex" title={action.reason}>
      {children}
      <span className="sr-only">{action.reason}</span>
    </span>
  )
}

// The one visible line that says why a dossier can no longer be acted on.
// Shared by both workspaces so "verrouillé" always reads the same way.
export function BlockedNotice({ action }: { action: ActionState }) {
  if (action.enabled) return null

  return (
    <p className="text-muted-foreground flex items-center gap-2 text-xs text-pretty">
      <Lock className="size-3.5 shrink-0" />
      {action.reason}
    </p>
  )
}

export function NotesBlock({ notes }: { notes: string }) {
  return (
    <Card>
      <CardContent>
        {notes.trim() ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {notes}
          </p>
        ) : (
          <EmptyState
            icon={FileText}
            title="Aucune note d'enquête"
            description="Le journaliste n'a pas encore rédigé de note sur ce dossier."
          />
        )}
      </CardContent>
    </Card>
  )
}
