import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationList } from '../../entities/notification/model'
import { useAppSession } from '../../entities/session/model'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  Button,
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function NotificationsPage() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['notifications', session?.user.actorId ?? null],
    queryFn: () => apiRequest<NotificationList>('/api/notifications'),
    enabled: !!session?.user.actorId,
  })

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest<null>(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiRequest<null>('/api/notifications/read-all', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return (
    <PageLayout
      title="Boîte de notifications"
      description="Vue simple pour lire les notifications métier liées à la session courante."
      actions={
        <Button
          variant="secondary"
          disabled={markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
        >
          Tout marquer comme lu
        </Button>
      }
    >
      <SectionCard title="Notifications">
        {query.data?.items.length ? (
          <div className="grid gap-3">
            {query.data.items.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{item.theme}</p>
                    <p className="text-sm text-slate-600">{item.type}</p>
                  </div>
                  <StatusBadge value={item.isRead ? 'LU' : 'NON_LU'} />
                </div>
                <p className="mt-2 text-sm text-slate-700">{item.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Créée le {formatDateTime(item.createdAt)}
                </p>
                {!item.isRead ? (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      disabled={markReadMutation.isPending}
                      onClick={() => markReadMutation.mutate(item.id)}
                    >
                      Marquer comme lu
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucune notification"
            description="La boite de notifications est vide pour le moment."
          />
        )}
      </SectionCard>
    </PageLayout>
  )
}
