import { Bell } from 'lucide-react'
import { Badge } from '@shared/ui/shadcn/badge'
import { Card, CardContent } from '@shared/ui/shadcn/card'
import { AppLayout } from './app-layout'
import { notifications } from './data'
import { useResolvedActor } from './session-routing'

export function NotificationsDashboard() {
  const { actor } = useResolvedActor('journalist')

  return (
    <AppLayout actor={actor} page="notifications">
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.title} className="py-0">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{notification.title}</h2>
                  <Badge
                    variant={notification.unread ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {notification.badge}
                  </Badge>
                  {notification.unread ? (
                    <Badge variant="outline">Non lue</Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {notification.body}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}
