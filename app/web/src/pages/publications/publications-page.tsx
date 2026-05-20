import { Link } from '@tanstack/react-router'
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

const publicationSections = [
  {
    to: '/publications/list',
    title: 'Liste',
    description: 'Voir les publications sorties du desk.',
  },
  {
    to: '/publications/corrections',
    title: 'Correctifs',
    description: 'Publier une correction sur une publication existante.',
  },
] as const

export function PublicationsPage() {
  return (
    <PageLayout
      title="Publications"
      description="Choisis une vue. La liste reste separee des actions editoriales."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {publicationSections.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="rounded-[1.35rem] border border-[#eee9e2] bg-white/84 p-5 shadow-[0_16px_45px_rgba(33,28,23,0.055)] transition duration-200 hover:-translate-y-0.5 hover:bg-white"
          >
            <p className="text-sm font-black text-[#171514]">{section.title}</p>
            <p className="mt-2 text-sm leading-6 text-[#706a63]">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}

export function PublicationsListPage() {
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
      description="Liste interne des publications sorties du desk."
    >
      <SectionCard title="Flux de publications">
        {query.data?.items.length ? (
          <div className="grid gap-3">
            {query.data.items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[1.15rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
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
                    value={item.isCorrection ? 'CORRECTION' : item.finalVerdict}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#706a63]">
                  {item.verifiedLinks.length} lien(s) verifies |{' '}
                  {item.verifiedMedia.length} media verifies
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee9e2] pt-3">
                  <p className="text-xs font-bold text-[#918a83]">
                    Publie le {formatDateTime(item.publishedAt)}
                  </p>
                  {canCorrect && !item.isCorrection ? (
                    <Link
                      to="/publications/corrections"
                      search={{ publicationId: item.id }}
                      className="text-xs font-black text-[#706a63] underline-offset-4 transition hover:text-[#171514] hover:underline"
                    >
                      Creer un correctif
                    </Link>
                  ) : null}
                </div>
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
    </PageLayout>
  )
}

export function PublicationCorrectionsPage(props: { publicationId?: string }) {
  const { session } = useAppSession()
  const canCorrect = hasRole(session, ['EDITORIAL_DIRECTOR'])

  return (
    <PageLayout
      title="Correctifs"
      description="Action editoriale sur une publication deja sortie."
    >
      {canCorrect ? (
        <PublishCorrectionForm initialPublicationId={props.publicationId} />
      ) : (
        <SectionCard title="Correction">
          <EmptyState
            title="Acces reserve au directeur"
            description="La publication d'une correction ne concerne que la direction editoriale."
          />
        </SectionCard>
      )}
    </PageLayout>
  )
}
