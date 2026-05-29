import { Bell, FileCheck2, Inbox, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import type { Actor } from './types'

export function MetricGrid({ actor }: { actor: Actor }) {
  const metrics = useMemo(
    () => [
      ['Sujets ouverts', actor === 'guest' ? '24' : '18', Inbox, '+12%'],
      ['À arbitrer', actor === 'director' ? '7' : '3', ShieldCheck, 'priorité'],
      ['Preuves verifiees', '142', FileCheck2, '+28'],
      ['Notifications', '12', Bell, 'non lues'],
    ],
    [actor],
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, Icon, hint]) => (
        <Card key={label as string}>
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium">
              {label as string}
              <Icon className="size-4" />
            </CardTitle>
            <CardDescription>
              <span className="text-foreground text-3xl font-semibold">
                {value as string}
              </span>
              <span className="ml-2">{hint as string}</span>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
