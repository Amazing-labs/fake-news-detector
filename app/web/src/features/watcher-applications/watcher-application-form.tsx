import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  submitWatcherApplication,
  watcherApplicationQueryKeys,
} from '../../entities/watcher-application/api'
import { toApiErrorMessage } from '../../shared/api/http'
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
      submitWatcherApplication({
        motivation,
      }),
    onSuccess: () => {
      setMotivation('')
      void queryClient.invalidateQueries({
        queryKey: watcherApplicationQueryKeys.all,
      })
    },
  })

  return (
    <SectionCard
      title="Candidature vigie"
      description="Permet de tester le flux citoyen de montée en rôle vigie."
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
