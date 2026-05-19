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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
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
              {query.data.items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black tracking-[-0.015em] text-[#171514]">
                        Publication #{index + 1}
                      </p>
                      <p className="text-sm leading-6 text-[#706a63]">
                        {item.isCorrection
                          ? 'Correction editoriale'
                          : 'Verdict publie'}
                      </p>
                    </div>
                    <StatusBadge
                      value={
                        item.isCorrection ? 'CORRECTION' : item.finalVerdict
                      }
                    />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#706a63]">
                    {item.verifiedLinks.length} lien(s) verifies |{' '}
                    {item.verifiedMedia.length} media verifies
                  </p>
                  <p className="mt-3 text-xs font-bold text-[#918a83]">
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
