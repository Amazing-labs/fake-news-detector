import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiRequest, toApiErrorMessage } from '../../shared/api/http'
import {
  Button,
  Notice,
  SectionCard,
  TextArea,
} from '../../shared/ui/primitives'

export function WatcherApplicationForm() {
  const queryClient = useQueryClient()
  const [motivation, setMotivation] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest<{ id: string }>('/api/watcher-applications', {
        method: 'POST',
        body: JSON.stringify({ motivation }),
      }),
    onSuccess: () => {
      setMotivation('')
      void queryClient.invalidateQueries({ queryKey: ['watcher-applications'] })
    },
  })

  return (
    <SectionCard
      title="Candidature vigie"
      description="Permet de tester le flux citoyen de montee en role vigie."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <TextArea
          label="Motivation"
          value={motivation}
          onChange={(event) => setMotivation(event.target.value)}
        />
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Candidature envoyee.</Notice>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Envoi...' : 'Envoyer la candidature'}
        </Button>
      </form>
    </SectionCard>
  )
}
