import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import {
  activateJournalist,
  banJournalist,
  disableJournalist,
  journalistQueryKeys,
  listJournalists,
} from '@entities/journalist/api'
import { CreateJournalistForm } from '@features/journalists/create-journalist-form'
import { toApiErrorMessage } from '@shared/api/http'
import { Button } from '@shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { AppLayout } from '../app-layout'
import { StatusBadge } from '../workspace-ui'

const people = [
  {
    name: 'Awa Diarra',
    role: 'Citoyenne vigie',
    status: 'ACTIVE',
    load: '4 preuves envoyées',
    type: 'citizen',
  },
  {
    name: 'Malik Sissoko',
    role: 'Citoyen',
    status: 'DISABLED',
    load: '0 signalement ouvert',
    type: 'citizen',
  },
]

export function PeopleManagementPage() {
  return (
    <AppLayout actor="director" page="people">
      <Tabs defaultValue="journalists">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="journalists">Journalistes</TabsTrigger>
            <TabsTrigger value="citizens">Citoyens</TabsTrigger>
            <TabsTrigger value="watchers">Vigies</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link to="/journalists/create">
              <UserPlus />
              Créer journaliste
            </Link>
          </Button>
        </div>
        <TabsContent value="journalists" className="mt-4">
          <PeopleList filter="journalist" />
        </TabsContent>
        <TabsContent value="citizens" className="mt-4">
          <PeopleList filter="citizen" />
        </TabsContent>
        <TabsContent value="watchers" className="mt-4">
          <PeopleList filter="citizen" watcherOnly />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function PeopleList(props: {
  filter: 'journalist' | 'citizen'
  watcherOnly?: boolean
}) {
  const queryClient = useQueryClient()
  const journalistsQuery = useQuery({
    queryKey: journalistQueryKeys.list(),
    queryFn: listJournalists,
    enabled: props.filter === 'journalist',
  })
  const journalistStatusMutation = useMutation({
    mutationFn: (input: {
      journalistId: string
      action: 'activate' | 'ban' | 'disable'
    }) => {
      if (input.action === 'activate') {
        return activateJournalist(input.journalistId)
      }

      if (input.action === 'ban') {
        return banJournalist(input.journalistId, { reason: 'OTHER' })
      }

      return disableJournalist(input.journalistId, { reason: 'OTHER' })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: journalistQueryKeys.all })
    },
  })
  const rows = people.filter((person) => {
    if (person.type !== props.filter) return false
    if (props.watcherOnly) return person.role.includes('vigie')
    return true
  })
  const journalistRows = journalistsQuery.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comptes</CardTitle>
        <CardDescription>
          Activation, suspension ou bannissement selon le statut courant.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {props.filter === 'journalist' ? (
          <>
            {journalistsQuery.isPending ? (
              <p className="text-muted-foreground text-sm">
                Chargement des journalistes...
              </p>
            ) : null}
            {journalistsQuery.isError ? (
              <p className="text-destructive text-sm">
                {toApiErrorMessage(journalistsQuery.error)}
              </p>
            ) : null}
            {!journalistsQuery.isPending && journalistRows.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun journaliste provisionné.
              </p>
            ) : null}
            {journalistRows.map((journalist) => (
              <div
                key={journalist.id}
                className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium">{journalist.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {journalist.email} / {journalist.activeInvestigationsCount}{' '}
                    enquêtes actives
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={journalist.status} />
                  {journalist.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={journalistStatusMutation.isPending}
                      onClick={() =>
                        journalistStatusMutation.mutate({
                          journalistId: journalist.id,
                          action: 'disable',
                        })
                      }
                    >
                      Désactiver
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={journalistStatusMutation.isPending}
                      onClick={() =>
                        journalistStatusMutation.mutate({
                          journalistId: journalist.id,
                          action: 'activate',
                        })
                      }
                    >
                      Activer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={
                      journalistStatusMutation.isPending ||
                      journalist.status === 'BANNED'
                    }
                    onClick={() =>
                      journalistStatusMutation.mutate({
                        journalistId: journalist.id,
                        action: 'ban',
                      })
                    }
                  >
                    Bannir
                  </Button>
                </div>
              </div>
            ))}
            {journalistStatusMutation.isError ? (
              <p className="text-destructive text-sm">
                {toApiErrorMessage(journalistStatusMutation.error)}
              </p>
            ) : null}
          </>
        ) : (
          rows.map((person) => (
            <div
              key={person.name}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="font-medium">{person.name}</p>
                <p className="text-muted-foreground text-sm">
                  {person.role} / {person.load}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={person.status} />
                <Button size="sm" variant="outline" asChild>
                  <Link
                    to="/journalists/status"
                    search={{ journalistId: person.name }}
                  >
                    Gérer
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function UserCreateWorkspacePage() {
  return (
    <AppLayout actor="director" page="people">
      <CreateJournalistForm />
    </AppLayout>
  )
}
