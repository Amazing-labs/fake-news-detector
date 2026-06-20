import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationList } from '../../entities/notification/model'
import { useAppSession } from '../../entities/session/model'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  Button,
  EmptyState,
  PageLayout,
  StatusBadge,
} from '../../shared/ui/primitives'

type NotificationFilter = 'ALL' | 'PUBLICATION' | 'CORRECTION' | 'ALERT' | 'ARCHIVED_PUBLICATION'

const NOTIFICATION_CONFIG: Record<
  NotificationFilter,
  { label: string; color: string; icon: string; bgColor: string; borderColor: string; gradient: string }
> = {
  ALL: { label: 'Toutes', color: 'bg-indigo-600', icon: '🔔', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300', gradient: 'from-indigo-500 to-purple-600' },
  PUBLICATION: { label: 'Publications', color: 'bg-emerald-600', icon: '📰', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300', gradient: 'from-emerald-500 to-teal-600' },
  CORRECTION: { label: 'Corrections', color: 'bg-amber-600', icon: '✏️', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', gradient: 'from-amber-500 to-orange-600' },
  ALERT: { label: 'Alertes', color: 'bg-rose-600', icon: '⚠️', bgColor: 'bg-rose-50', borderColor: 'border-rose-300', gradient: 'from-rose-500 to-pink-600' },
  ARCHIVED_PUBLICATION: {
    label: 'Archivées',
    color: 'bg-slate-600',
    icon: '📁',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    gradient: 'from-slate-500 to-gray-600',
  },
}

export function NotificationsPage() {
  const { session } = useAppSession()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<NotificationFilter>('ALL')

  const query = useQuery({
    queryKey: ['notifications', session?.user.actorId ?? null],
    queryFn: () => apiRequest<NotificationList>('/api/notifications'),
    enabled: !!session?.user.actorId,
  })

  const filteredNotifications = query.data?.items.filter((item) => {
    if (filter === 'ALL') return true
    return item.type === filter
  })

  const unreadCount = query.data?.items.filter((item) => !item.isRead).length ?? 0
  const unreadByType = query.data?.items.reduce((acc, item) => {
    if (!item.isRead) {
      acc[item.type] = (acc[item.type] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) ?? {}

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
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
      <PageLayout
        title="Centre de Notifications"
        description="Gérez vos alertes et restez informé de l'activité éditoriale"
        actions={
          <Button
            variant="secondary"
            disabled={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            ✨ Tout marquer comme lu
          </Button>
        }
      >
        {/* Header avec statistiques en grille */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Carte principale non lues */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-6 shadow-2xl text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-violet-200 text-sm font-medium mb-1">Notifications non lues</p>
                <p className="text-5xl font-bold mb-2">{unreadCount}</p>
                <p className="text-violet-100 text-sm">Messages nécessitant votre attention</p>
              </div>
              <div className="text-6xl">🔔</div>
            </div>
            <div className="mt-6 h-2 bg-violet-400/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min((unreadCount / Math.max(query.data?.items.length || 1, 1)) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Carte total */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 p-6 shadow-xl text-white">
            <p className="text-purple-200 text-sm font-medium mb-1">Total notifications</p>
            <p className="text-4xl font-bold text-white mb-2">{query.data?.items.length ?? 0}</p>
            <p className="text-purple-100 text-sm">Dans votre boîte de réception</p>
            <div className="mt-4 text-4xl">📊</div>
          </div>
        </div>

        {/* Filtres et statistiques par type */}
        <div className="grid gap-6 lg:grid-cols-4 mb-8">
          {(Object.keys(NOTIFICATION_CONFIG) as NotificationFilter[]).map((type) => {
            const config = NOTIFICATION_CONFIG[type]
            const count = unreadByType[type] || 0
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 transform hover:scale-105 ${
                  filter === type
                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-2xl`
                    : 'bg-gradient-to-br from-violet-50 to-purple-50 text-slate-700 border-2 border-violet-200 hover:border-violet-400 shadow-lg'
                }`}
              >
                <div className="relative z-10">
                  <div className="text-4xl mb-2">{config.icon}</div>
                  <p className={`font-bold ${filter === type ? 'text-white' : 'text-slate-800'}`}>{config.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${filter === type ? 'text-white/90' : 'text-violet-600'}`}>{count}</p>
                </div>
                {filter === type && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                )}
              </button>
            )
          })}
        </div>

        {/* Liste des notifications avec design amélioré */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-transparent bg-clip-text">
              Notifications
            </span>
            <span className="text-slate-400">({filteredNotifications?.length ?? 0})</span>
          </h2>

          {filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="grid gap-4">
              {filteredNotifications.map((item, index) => {
                const config = NOTIFICATION_CONFIG[item.type as NotificationFilter] || NOTIFICATION_CONFIG.ALL
                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                      !item.isRead 
                        ? `bg-gradient-to-br from-white to-violet-50 border-2 ${config.borderColor} shadow-xl hover:shadow-2xl` 
                        : 'bg-gradient-to-br from-violet-50/50 to-purple-50/50 border-2 border-slate-200 shadow-md hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Barre latérale colorée */}
                    {!item.isRead && (
                      <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${config.gradient}`} />
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start gap-5">
                        {/* Icône dans cercle dégradé */}
                        <div className={`flex-shrink-0 rounded-2xl p-4 bg-gradient-to-br ${config.gradient} shadow-lg`}>
                          <span className="text-3xl">{config.icon}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className={`text-xl font-bold ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                {item.theme}
                              </h3>
                              <p className={`text-sm font-semibold ${config.color.replace('bg-', 'text-')} mt-1`}>
                                {config.label}
                              </p>
                            </div>
                            <StatusBadge value={item.isRead ? 'LU' : 'NON_LU'} />
                          </div>
                          
                          <p className={`text-base leading-relaxed ${!item.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                            {item.message}
                          </p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            <p className="text-sm text-slate-400">
                              🕐 {formatDateTime(item.createdAt)}
                            </p>
                            {!item.isRead && (
                              <Button
                                variant="secondary"
                                disabled={markReadMutation.isPending}
                                onClick={() => markReadMutation.mutate(item.id)}
                                className={`bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 shadow-md`}
                              >
                                ✓ Marquer comme lu
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/80 backdrop-blur-sm p-12 shadow-xl border-2 border-dashed border-violet-300 text-center">
              <div className="text-6xl mb-4">📭</div>
              <EmptyState
                title="Aucune notification"
                description={filter === 'ALL' ? 'Votre boîte de notifications est vide pour le moment.' : `Aucune notification de type ${NOTIFICATION_CONFIG[filter].label}.`}
              />
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  )
}
