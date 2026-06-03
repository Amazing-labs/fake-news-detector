import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  submitWatcherApplication,
  watcherApplicationQueryKeys,
} from '../../entities/watcher-application/api'
import { toApiErrorMessage } from '../../shared/api/http'
import {
  DarkButton,
  DarkFormCard,
  DarkTextArea,
} from '../../shared/ui/dark-form'
import { Notice } from '../../shared/ui/primitives'

export function WatcherApplicationForm() {
  const queryClient = useQueryClient()
  const [motivation, setMotivation] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      submitWatcherApplication({
        motivation: motivation.trim(),
      }),
    onSuccess: () => {
      setMotivation('')
      toast.success('Candidature envoyée.')
      void queryClient.invalidateQueries({
        queryKey: watcherApplicationQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  function handleSubmit() {
    if (motivation.trim().length < 20) {
      toast.error('Explique ta motivation en au moins 20 caractères.')
      return
    }

    mutation.mutate()
  }

  return (
    <DarkFormCard
      title="Espace vigie"
      description="Candidate pour contribuer aux enquêtes ouvertes par la rédaction."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <DarkTextArea
          label="Motivation"
          value={motivation}
          onChange={(event) => setMotivation(event.target.value)}
          placeholder="Explique pourquoi tu veux devenir vigie et comment tu peux aider la rédaction."
        />

        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Candidature envoyée.</Notice>
        ) : null}

        <div>
          <DarkButton type="submit" disabled={mutation.isPending}>
            <UserPlus className="size-4" />
            {mutation.isPending ? 'Envoi...' : 'Envoyer la candidature'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
