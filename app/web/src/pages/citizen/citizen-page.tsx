import { useQuery } from '@tanstack/react-query'
import type { CitizenWorkspaceSummary } from '../../entities/citizen/model'
import type { PublicationList } from '../../entities/publication/model'
import type { ReportList } from '../../entities/report/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { apiRequest } from '../../shared/api/http'
import {
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function CitizenPage() {
  const { session } = useAppSession()
  const enabled = hasRole(session, ['CITIZEN'])

  const reportsQuery = useQuery({
    queryKey: ['citizen-reports', session?.user.actorId ?? null],
    queryFn: () =>
      apiRequest<ReportList>(
        `/api/reports?citizenId=${session?.user.actorId ?? ''}`,
      ),
    enabled: !!session?.user.actorId && enabled,
  })

  const publicationsQuery = useQuery({
    queryKey: ['citizen-publications'],
    queryFn: () => apiRequest<PublicationList>('/api/publications'),
    enabled,
  })

  const summary: CitizenWorkspaceSummary = {
    reportCount: reportsQuery.data?.total ?? 0,
    watcherApplicationCount: session?.user.citizenType === 'WATCHER' ? 1 : 0,
    publicationCount: publicationsQuery.data?.total ?? 0,
  }

  if (!enabled) {
    return (
      <PageLayout
        title="Espace citoyen"
        description="Vue d'entree pour le parcours citoyen."
      >
        <EmptyState
          title="Acces reserve au citoyen"
          description="Cette page est utile pour tester le parcours signalement, vigie et publications."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Espace citoyen"
      description="Vue metier citoyenne pour suivre ses signalements, sa candidature vigie, et les publications exposees."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Mes signalements">
          <p className="text-3xl font-semibold text-slate-950">
            {summary.reportCount}
          </p>
          <p className="text-sm text-slate-600">
            Le detail complet reste disponible dans la page Signalements.
          </p>
        </SectionCard>

        <SectionCard title="Candidatures vigie">
          <p className="text-3xl font-semibold text-slate-950">
            {summary.watcherApplicationCount}
          </p>
          <p className="text-sm text-slate-600">
            {session?.user.citizenType === 'WATCHER'
              ? 'Votre profil vigie est actif.'
              : 'Le suivi détaillé de candidature viendra avec un endpoint citoyen dédié.'}
          </p>
        </SectionCard>

        <SectionCard title="Publications">
          <p className="text-3xl font-semibold text-slate-950">
            {summary.publicationCount}
          </p>
          <p className="text-sm text-slate-600">
            Les corrections et publications sont consultables dans Publications.
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Derniers signalements">
          {reportsQuery.data?.items.length ? (
            <div className="grid gap-3">
              {reportsQuery.data.items.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">
                        {report.theme}
                      </p>
                      <p className="text-sm text-slate-600">
                        {report.title || 'Sans titre'}
                      </p>
                    </div>
                    <StatusBadge value={report.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun signalement"
              description="Le citoyen n'a pas encore envoye de signalement."
            />
          )}
        </SectionCard>

        <SectionCard title="Dernieres publications">
          {publicationsQuery.data?.items.length ? (
            <div className="grid gap-3">
              {publicationsQuery.data.items.slice(0, 5).map((publication) => (
                <div
                  key={publication.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">
                        {publication.id}
                      </p>
                      <p className="text-sm text-slate-600">
                        Enquete {publication.investigationId}
                      </p>
                    </div>
                    <StatusBadge
                      value={
                        publication.isCorrection
                          ? 'CORRECTION'
                          : publication.finalVerdict
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune publication"
              description="Aucune publication n'est encore disponible."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}
