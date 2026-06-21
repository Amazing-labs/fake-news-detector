import { useRouterState } from '@tanstack/react-router'
import { cn } from '../lib/utils'
import { Skeleton } from './shadcn/skeleton'

export function RouteProgressBar() {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' })

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-[9999] h-[3px] transition-opacity duration-300',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-full w-full rounded-none bg-primary/70" />
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}

export function PageLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Spinner className="size-8 text-primary" />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  )
}
