import type { ComponentType, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toApiErrorMessage } from '@shared/api/http'
import { cn } from '@shared/lib/utils'
import { Badge } from '@shared/ui/shadcn/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { domainLabel } from './workspace-labels'

const STATUS_PILL = 'h-6 rounded-full border-transparent px-2.5 font-medium'

// One tone per meaning, so a colour says the same thing everywhere it appears:
// where the work stands, not which enum it came from.
const TONE = {
  idle: '', // keeps the neutral `secondary` pill: nothing is expected yet
  active: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  waiting: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  rework: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  done: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  refused: 'bg-red-500/15 text-red-700 dark:text-red-400',
  closed: 'bg-muted text-muted-foreground',
} as const

const STATUS_TONE: Record<string, keyof typeof TONE> = {
  // Lifecycle: OPEN → IN_PROGRESS → PENDING_REVIEW → PUBLISHED | NEEDS_REVISION
  OPEN: 'idle',
  IN_PROGRESS: 'active',
  PENDING: 'waiting',
  PENDING_REVIEW: 'waiting',
  NEEDS_REVISION: 'rework',
  PUBLISHED: 'done',
  ARCHIVED: 'closed',
  ARCHIVED_PUBLICATION: 'closed',
  CANCELED: 'refused',
  // Accounts and watcher applications
  ACTIVE: 'done',
  APPROVED: 'done',
  REJECTED: 'refused',
  DISABLED: 'closed',
  BANNED: 'refused',
  // Verdicts
  TRUE: 'done',
  FALSE: 'refused',
  MISLEADING: 'waiting',
  UNVERIFIABLE: 'idle',
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const tone = STATUS_TONE[status]

  return (
    <Badge
      variant="secondary"
      className={cn(STATUS_PILL, tone ? TONE[tone] : '', className)}
    >
      {domainLabel(status)}
    </Badge>
  )
}

export function MetaCell({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="bg-muted/40 rounded-xl p-3.5">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <div className="mt-1 font-medium tracking-tight">{value}</div>
    </div>
  )
}

// Friendly placeholder for empty tabs/lists — an icon, a title and a short line
// so an absent resource reads as intentional rather than a broken/blank panel.
export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: ComponentType<{ className?: string }>
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="bg-muted text-muted-foreground/70 mb-4 grid size-12 place-items-center rounded-full">
          <Icon className="size-6" />
        </span>
      ) : null}
      <p className="font-medium tracking-tight text-balance">{title}</p>
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  )
}

// Failed fetches read as a state of the panel, like EmptyState — never as a bare
// red sentence. The destructive tone is carried by the icon and the frame so the
// message itself keeps full contrast.
export function ErrorState({
  error,
  className,
}: {
  error: unknown
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center',
        className,
      )}
    >
      <span className="bg-destructive/10 text-destructive mb-4 grid size-12 place-items-center rounded-full">
        <AlertTriangle className="size-6" />
      </span>
      <p className="font-medium tracking-tight text-balance">
        Chargement impossible
      </p>
      <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed text-pretty">
        {toApiErrorMessage(error)}
      </p>
    </div>
  )
}

export function StatCard(props: {
  title: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
}) {
  const Icon = props.icon

  return (
    <Card className="gap-0 py-5 transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_18px_44px_-24px_rgba(0,0,0,0.22)]">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            {props.title}
          </CardTitle>
          <span className="bg-muted/60 text-muted-foreground/70 grid size-8 place-items-center rounded-lg">
            <Icon className="size-4" />
          </span>
        </div>
        <CardDescription className="flex items-baseline gap-2">
          <span className="text-foreground text-3xl font-semibold tracking-tight tabular-nums">
            {props.value}
          </span>
          <span className="text-sm">{props.hint}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
