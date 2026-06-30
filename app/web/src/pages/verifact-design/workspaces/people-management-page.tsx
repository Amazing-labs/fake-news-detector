import { useState, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import {
  activateCitizen,
  banCitizen,
  citizenQueryKeys,
  disableCitizen,
  listCitizens,
} from '@entities/citizen/api'
import {
  activateJournalist,
  banJournalist,
  disableJournalist,
  journalistQueryKeys,
  listJournalists,
} from '@entities/journalist/api'
import { formatCitizenType } from '@entities/session/model'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/shadcn/dialog'
import { Label } from '@shared/ui/shadcn/label'
import { Textarea } from '@shared/ui/shadcn/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/ui/shadcn/tabs'
import { LoadingRow } from '@shared/ui/loader'
import { AppLayout } from '../app-layout'
import { StatusBadge } from '../workspace-ui'

// Mirrors the server journalistStatusReasonSchema / citizenManagementSchema.
type StatusReason =
  | 'SPAM'
  | 'ABUSE'
  | 'FRAUD'
  | 'INACTIVITY'
  | 'USER_REQUEST'
  | 'OTHER'

const STATUS_REASONS: { value: StatusReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'ABUSE', label: 'Abus de la plateforme' },
  { value: 'FRAUD', label: 'Fraude' },
  { value: 'INACTIVITY', label: 'Inactivité' },
  { value: 'USER_REQUEST', label: "Demande de l'utilisateur" },
  { value: 'OTHER', label: 'Autre' },
]

// A restrictive action (ban or disable) awaiting a reason from the director.
type PendingAction = { id: string; name: string; action: 'ban' | 'disable' }

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
          <JournalistsList />
        </TabsContent>
        <TabsContent value="citizens" className="mt-4">
          <CitizensList />
        </TabsContent>
        <TabsContent value="watchers" className="mt-4">
          <CitizensList watcherOnly />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

function PeopleCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comptes</CardTitle>
        <CardDescription>
          Activation, suspension ou bannissement selon le statut courant.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">{children}</CardContent>
    </Card>
  )
}

// Asks the director for a reason (and optional details) before a ban/disable.
// The inner form is remounted (via key) on every new target so its fields
// always start empty — no effect-driven reset needed.
function StatusReasonDialog(props: {
  pending: PendingAction | null
  isPending: boolean
  errorMessage: string | null
  onCancel: () => void
  onConfirm: (reason: StatusReason, details: string) => void
}) {
  return (
    <Dialog
      open={props.pending !== null}
      onOpenChange={(next) => {
        // Don't let the user dismiss the dialog mid-request — the mutation would
        // keep running in the background while they think they cancelled.
        if (!next && !props.isPending) props.onCancel()
      }}
    >
      <DialogContent>
        {props.pending ? (
          <ReasonForm
            key={`${props.pending.id}:${props.pending.action}`}
            action={props.pending.action}
            name={props.pending.name}
            isPending={props.isPending}
            errorMessage={props.errorMessage}
            onCancel={props.onCancel}
            onConfirm={props.onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

// Confirm stays disabled until a reason is chosen so the action is never
// silently sent with a hard-coded default.
function ReasonForm(props: {
  action: 'ban' | 'disable'
  name: string
  isPending: boolean
  errorMessage: string | null
  onCancel: () => void
  onConfirm: (reason: StatusReason, details: string) => void
}) {
  const [reason, setReason] = useState<StatusReason | ''>('')
  const [details, setDetails] = useState('')
  const isBan = props.action === 'ban'

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isBan ? 'Bannir le compte' : 'Désactiver le compte'}
        </DialogTitle>
        <DialogDescription>
          Indiquez la raison de cette action sur {props.name}.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <span className="text-sm font-medium">Raison</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_REASONS.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant={reason === item.value ? 'default' : 'outline'}
                aria-pressed={reason === item.value}
                onClick={() => setReason(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        <Label className="grid gap-2">
          Détails (optionnel)
          <Textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Commentaire interne"
          />
        </Label>
        {props.errorMessage ? (
          <p className="text-destructive text-sm">{props.errorMessage}</p>
        ) : null}
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={props.onCancel}
          disabled={props.isPending}
        >
          Annuler
        </Button>
        <Button
          variant={isBan ? 'destructive' : 'default'}
          disabled={!reason}
          loading={props.isPending}
          onClick={() => reason && props.onConfirm(reason, details.trim())}
        >
          {isBan ? 'Bannir' : 'Désactiver'}
        </Button>
      </DialogFooter>
    </>
  )
}

function JournalistsList() {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<PendingAction | null>(null)
  const journalistsQuery = useQuery({
    queryKey: journalistQueryKeys.list(),
    queryFn: listJournalists,
  })
  const statusMutation = useMutation({
    mutationFn: (input: {
      journalistId: string
      action: 'activate' | 'ban' | 'disable'
      reason?: StatusReason
      details?: string
    }) => {
      if (input.action === 'activate') {
        return activateJournalist(input.journalistId)
      }
      const payload = { reason: input.reason, details: input.details }
      if (input.action === 'ban') {
        return banJournalist(input.journalistId, payload)
      }
      return disableJournalist(input.journalistId, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: journalistQueryKeys.all })
      setPending(null)
    },
  })
  const rows = journalistsQuery.data?.items ?? []

  return (
    <PeopleCard>
      {journalistsQuery.isPending ? (
        <LoadingRow label="Chargement des journalistes…" />
      ) : null}
      {journalistsQuery.isError ? (
        <p className="text-destructive text-sm">
          {toApiErrorMessage(journalistsQuery.error)}
        </p>
      ) : null}
      {!journalistsQuery.isPending &&
      !journalistsQuery.isError &&
      rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Aucun journaliste provisionné.
        </p>
      ) : null}
      {rows.map((journalist) => (
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
                disabled={statusMutation.isPending}
                onClick={() =>
                  setPending({
                    id: journalist.id,
                    name: journalist.name,
                    action: 'disable',
                  })
                }
              >
                Désactiver
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={statusMutation.isPending}
                loading={
                  statusMutation.isPending &&
                  statusMutation.variables?.journalistId === journalist.id
                }
                onClick={() =>
                  statusMutation.mutate({
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
                statusMutation.isPending || journalist.status === 'BANNED'
              }
              onClick={() =>
                setPending({
                  id: journalist.id,
                  name: journalist.name,
                  action: 'ban',
                })
              }
            >
              Bannir
            </Button>
          </div>
        </div>
      ))}
      {statusMutation.isError && pending === null ? (
        <p className="text-destructive text-sm">
          {toApiErrorMessage(statusMutation.error)}
        </p>
      ) : null}
      <StatusReasonDialog
        pending={pending}
        isPending={statusMutation.isPending}
        errorMessage={
          statusMutation.isError
            ? toApiErrorMessage(statusMutation.error)
            : null
        }
        onCancel={() => setPending(null)}
        onConfirm={(reason, details) => {
          if (!pending) return
          statusMutation.mutate({
            journalistId: pending.id,
            action: pending.action,
            reason,
            details: details || undefined,
          })
        }}
      />
    </PeopleCard>
  )
}

function CitizensList({ watcherOnly = false }: { watcherOnly?: boolean }) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState<PendingAction | null>(null)
  const citizensQuery = useQuery({
    queryKey: citizenQueryKeys.list(),
    queryFn: listCitizens,
  })
  const statusMutation = useMutation({
    mutationFn: (input: {
      citizenId: string
      action: 'activate' | 'ban' | 'disable'
      reason?: StatusReason
      details?: string
    }) => {
      if (input.action === 'activate') {
        return activateCitizen(input.citizenId)
      }
      const payload = { reason: input.reason, details: input.details }
      if (input.action === 'ban') {
        return banCitizen(input.citizenId, payload)
      }
      return disableCitizen(input.citizenId, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: citizenQueryKeys.all })
      setPending(null)
    },
  })
  const allRows = citizensQuery.data?.items ?? []
  const rows = watcherOnly
    ? allRows.filter((citizen) => citizen.citizenType === 'WATCHER')
    : allRows
  const emptyLabel = watcherOnly
    ? 'Aucune vigie pour le moment.'
    : 'Aucun citoyen pour le moment.'

  return (
    <PeopleCard>
      {citizensQuery.isPending ? (
        <LoadingRow
          label={
            watcherOnly ? 'Chargement des vigies…' : 'Chargement des citoyens…'
          }
        />
      ) : null}
      {citizensQuery.isError ? (
        <p className="text-destructive text-sm">
          {toApiErrorMessage(citizensQuery.error)}
        </p>
      ) : null}
      {!citizensQuery.isPending &&
      !citizensQuery.isError &&
      rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      ) : null}
      {rows.map((citizen) => (
        <div
          key={citizen.id}
          className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]"
        >
          <div>
            <p className="font-medium">{citizen.name}</p>
            <p className="text-muted-foreground text-sm">
              {citizen.email} / {formatCitizenType(citizen.citizenType)} /{' '}
              {citizen.openReportsCount} signalement
              {citizen.openReportsCount > 1 ? 's' : ''} ouvert
              {citizen.openReportsCount > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={citizen.status} />
            {citizen.status === 'ACTIVE' ? (
              <Button
                size="sm"
                variant="outline"
                disabled={statusMutation.isPending}
                onClick={() =>
                  setPending({
                    id: citizen.id,
                    name: citizen.name,
                    action: 'disable',
                  })
                }
              >
                Désactiver
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={statusMutation.isPending}
                loading={
                  statusMutation.isPending &&
                  statusMutation.variables?.citizenId === citizen.id
                }
                onClick={() =>
                  statusMutation.mutate({
                    citizenId: citizen.id,
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
              disabled={statusMutation.isPending || citizen.status === 'BANNED'}
              onClick={() =>
                setPending({
                  id: citizen.id,
                  name: citizen.name,
                  action: 'ban',
                })
              }
            >
              Bannir
            </Button>
          </div>
        </div>
      ))}
      {statusMutation.isError && pending === null ? (
        <p className="text-destructive text-sm">
          {toApiErrorMessage(statusMutation.error)}
        </p>
      ) : null}
      <StatusReasonDialog
        pending={pending}
        isPending={statusMutation.isPending}
        errorMessage={
          statusMutation.isError
            ? toApiErrorMessage(statusMutation.error)
            : null
        }
        onCancel={() => setPending(null)}
        onConfirm={(reason, details) => {
          if (!pending) return
          statusMutation.mutate({
            citizenId: pending.id,
            action: pending.action,
            reason,
            details: details || undefined,
          })
        }}
      />
    </PeopleCard>
  )
}

export function UserCreateWorkspacePage() {
  return (
    <AppLayout actor="director" page="people">
      <CreateJournalistForm />
    </AppLayout>
  )
}
