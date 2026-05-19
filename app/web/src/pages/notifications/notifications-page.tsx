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
      title="Boite de notifications"
      description="Vue simple pour lire les notifications metier liees a la session courante."
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
                className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black tracking-[-0.015em] text-[#171514]">
                      {item.theme}
                    </p>
                    <p className="text-sm leading-6 text-[#706a63]">
                      {item.type}
                    </p>
                  </div>
                  <StatusBadge value={item.isRead ? 'LU' : 'NON_LU'} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#706a63]">
                  {item.message}
                </p>
                <p className="mt-3 text-xs font-bold text-[#918a83]">
                  Creee le {formatDateTime(item.createdAt)}
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
