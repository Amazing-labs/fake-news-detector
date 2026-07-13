import type { ComponentType } from 'react'
import { cn } from '@shared/lib/utils'
import { Badge } from '@shared/ui/shadcn/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import { domainLabel } from './workspace-labels'

const STATUS_PILL = 'h-6 rounded-full px-2.5 font-medium'

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  // Verified / healthy states carry the emerald "verified" accent used across
  // the product; pending is neutral, terminal-negative is destructive.
  if (status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE') {
    return (
      <Badge
        className={cn(
          STATUS_PILL,
          'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
          className,
        )}
      >
        {domainLabel(status)}
      </Badge>
    )
  }

  if (
    status === 'PENDING' ||
    status === 'OPEN' ||
    status === 'PENDING_REVIEW'
  ) {
    return (
      <Badge variant="secondary" className={cn(STATUS_PILL, className)}>
        {domainLabel(status)}
      </Badge>
    )
  }

  if (status === 'DISABLED' || status === 'REJECTED') {
    return (
      <Badge variant="destructive" className={cn(STATUS_PILL, className)}>
        {domainLabel(status)}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={cn(STATUS_PILL, className)}>
      {domainLabel(status)}
    </Badge>
  )
}

export function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/40 rounded-xl p-3.5">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="mt-1 font-medium tracking-tight">{value}</p>
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
