import { useQuery } from '@tanstack/react-query'
import type { PublicationList } from '../../entities/publication/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { PublishCorrectionForm } from '../../features/publications/publish-correction-form'
import { apiRequest } from '../../shared/api/http'
import { formatDateTime } from '../../shared/lib/format'
import {
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function PublicationsPage() {
  const { session } = useAppSession()
  const canCorrect = hasRole(session, ['EDITORIAL_DIRECTOR'])

  const query = useQuery({
    queryKey: ['publications'],
    queryFn: () => apiRequest<PublicationList>('/api/publications'),
    enabled: !!session,
  })

  return (
    <PageLayout
      title="Publications"
      description="Liste publique interne des publications et point d'entree de correction directeur."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {canCorrect ? (
          <PublishCorrectionForm />
        ) : (
          <SectionCard title="Correction">
            <EmptyState
              title="Acces reserve au directeur"
              description="La publication d'une correction ne concerne que la direction editoriale."
            />
          </SectionCard>
        )}

        <SectionCard title="Flux de publications">
          {query.data?.items.length ? (
            <div className="grid gap-3">
              {query.data.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{item.id}</p>
                      <p className="text-sm text-slate-600">
                        Enquete {item.investigationId}
                      </p>
                    </div>
                    <StatusBadge
                      value={
                        item.isCorrection ? 'CORRECTION' : item.finalVerdict
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.verifiedLinks.length} lien(s) verifies |{' '}
                    {item.verifiedMedia.length} media verifies
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Publie le {formatDateTime(item.publishedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune publication"
              description="Aucune publication n'est encore sortie du backend."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}
