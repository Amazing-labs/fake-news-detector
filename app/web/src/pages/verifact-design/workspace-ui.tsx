import type { ComponentType } from 'react'
import { cn } from '../../shared/lib/utils'
import { Badge } from '../../shared/ui/shadcn/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import { domainLabel } from './workspace-labels'

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  if (status === 'PUBLISHED' || status === 'APPROVED' || status === 'ACTIVE') {
    return (
      <Badge className={cn('h-6 rounded-full px-2.5', className)}>
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
      <Badge
        variant="secondary"
        className={cn('h-6 rounded-full px-2.5', className)}
      >
        {domainLabel(status)}
      </Badge>
    )
  }

  if (status === 'DISABLED' || status === 'REJECTED') {
    return (
      <Badge
        variant="destructive"
        className={cn('h-6 rounded-full px-2.5', className)}
      >
        {domainLabel(status)}
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn('h-6 rounded-full px-2.5', className)}
    >
      {domainLabel(status)}
    </Badge>
  )
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

export function StatCard(props: {
  title: string
  value: string
  hint: string
  icon: ComponentType<{ className?: string }>
}) {
  const Icon = props.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium">
          {props.title}
          <Icon className="size-4" />
        </CardTitle>
        <CardDescription>
          <span className="text-foreground text-3xl font-semibold">
            {props.value}
          </span>
          <span className="ml-2">{props.hint}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
