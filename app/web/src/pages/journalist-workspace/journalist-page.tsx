import { useQuery } from '@tanstack/react-query'
import type { InboxSubjectList } from '../../entities/inbox-subject/model'
import type { InvestigationList } from '../../entities/investigation/model'
import type { JournalistWorkspaceSummary } from '../../entities/journalist/model'
import { hasRole, useAppSession } from '../../entities/session/model'
import { apiRequest } from '../../shared/api/http'
import {
  EmptyState,
  PageLayout,
  SectionCard,
  StatusBadge,
} from '../../shared/ui/primitives'

export function JournalistPage() {
  const { session } = useAppSession()
  const enabled = hasRole(session, ['JOURNALIST'])

  const inboxQuery = useQuery({
    queryKey: ['journalist-inbox'],
    queryFn: () => apiRequest<InboxSubjectList>('/api/inbox-subjects'),
    enabled,
  })

  const investigationsQuery = useQuery({
    queryKey: ['journalist-investigations', session?.user.actorId ?? null],
    queryFn: () =>
      apiRequest<InvestigationList>(
        `/api/investigations?journalistId=${session?.user.actorId ?? ''}`,
      ),
    enabled: !!session?.user.actorId && enabled,
  })

  const pendingReviewQuery = useQuery({
    queryKey: ['journalist-pending-review'],
    queryFn: () =>
      apiRequest<InvestigationList>('/api/investigations?scope=pending-review'),
    enabled,
  })

  const summary: JournalistWorkspaceSummary = {
    inboxSubjectCount: inboxQuery.data?.total ?? 0,
    investigationCount: investigationsQuery.data?.total ?? 0,
    pendingReviewCount: pendingReviewQuery.data?.total ?? 0,
  }

  if (!enabled) {
    return (
      <PageLayout
        title="Espace journaliste"
        description="Vue d'entree pour le parcours journaliste."
      >
        <EmptyState
          title="Acces reserve au journaliste"
          description="Cette page rassemble l'inbox et les enquetes du journaliste."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Espace journaliste"
      description="Vue metier journaliste pour prendre un sujet, suivre ses enquetes, et pousser les dossiers en revue."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Inbox disponible">
          <p className="text-3xl font-semibold text-slate-950">
            {summary.inboxSubjectCount}
          </p>
          <p className="text-sm text-slate-600">
            Les sujets sont detailles dans la page Inbox.
          </p>
        </SectionCard>

        <SectionCard title="Mes enquetes">
          <p className="text-3xl font-semibold text-slate-950">
            {summary.investigationCount}
          </p>
          <p className="text-sm text-slate-600">
            Le travail detaille se fait dans la page Enquetes.
          </p>
        </SectionCard>

        <SectionCard title="Enquetes en attente">
          <p className="text-3xl font-semibold text-slate-950">
            {summary.pendingReviewCount}
          </p>
          <p className="text-sm text-slate-600">
            Permet de voir ce qui attend une decision editoriale.
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Mes enquetes recentes">
          {investigationsQuery.data?.items.length ? (
            <div className="grid gap-3">
              {investigationsQuery.data.items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{item.id}</p>
                      <p className="text-sm text-slate-600">
                        Inbox {item.inboxSubjectId}
                      </p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucune enquete"
              description="Le journaliste n'a pas encore pris de sujet."
            />
          )}
        </SectionCard>

        <SectionCard title="Inbox ouverte">
          {inboxQuery.data?.items.length ? (
            <div className="grid gap-3">
              {inboxQuery.data.items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{item.theme}</p>
                      <p className="text-sm text-slate-600">
                        Origin {item.origin}
                      </p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Inbox vide"
              description="Aucun sujet n'est actuellement propose au journaliste."
            />
          )}
        </SectionCard>
      </div>
    </PageLayout>
  )
}
