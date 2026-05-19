import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { hasRole, useAppSession } from '../../entities/session/model'
import { CreateJournalistForm } from '../../features/journalists/create-journalist-form'
import { apiRequest } from '../../shared/api/http'
import {
  Button,
  EmptyState,
  Input,
  PageLayout,
  SectionCard,
} from '../../shared/ui/primitives'

const reasons = [
  'SPAM',
  'ABUSE',
  'FRAUD',
  'INACTIVITY',
  'USER_REQUEST',
  'OTHER',
]

export function JournalistsPage() {
  const { session } = useAppSession()
  const canManage = hasRole(session, ['EDITORIAL_DIRECTOR'])
  const [journalistId, setJournalistId] = useState('')
  const [reason, setReason] = useState('OTHER')
  const [details, setDetails] = useState('')

  const actionMutation = useMutation({
    mutationFn: (action: 'ban' | 'disable' | 'activate') =>
      apiRequest<null>(`/api/journalists/${journalistId}/${action}`, {
        method: 'POST',
        body: JSON.stringify(
          action === 'activate'
            ? {}
            : { reason, details: details || undefined },
        ),
      }),
  })

  if (!canManage) {
    return (
      <PageLayout
        title="Journalistes"
        description="Espace d'administration des journalistes."
      >
        <EmptyState
          title="Acces reserve au directeur"
          description="Seul le directeur peut provisionner ou changer le statut des journalistes."
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Journalistes"
      description="Socle frontend minimal pour creer, desactiver, bannir et reactiver un journaliste."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
        <CreateJournalistForm />

        <SectionCard
          title="Actions de statut"
          description="Renseigne la reference interne du journaliste a administrer."
        >
          <div className="grid gap-3">
            <Input
              label="Reference journaliste"
              value={journalistId}
              onChange={(event) => setJournalistId(event.target.value)}
            />
            <Input
              label="Raison"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              list="journalist-reasons"
            />
            <datalist id="journalist-reasons">
              {reasons.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <Input
              label="Details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => actionMutation.mutate('activate')}>
                Activer
              </Button>
              <Button
                variant="secondary"
                onClick={() => actionMutation.mutate('disable')}
              >
                Desactiver
              </Button>
              <Button
                variant="danger"
                onClick={() => actionMutation.mutate('ban')}
              >
                Bannir
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageLayout>
  )
}
