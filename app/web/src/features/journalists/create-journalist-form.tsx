import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createJournalist,
  journalistQueryKeys,
} from '../../entities/journalist/api'
import { toApiErrorMessage } from '../../shared/api/http'
import { DarkButton, DarkFormCard, DarkInput } from '../../shared/ui/dark-form'
import { Notice } from '../../shared/ui/primitives'

export function CreateJournalistForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createJournalist({
        name,
        email,
      }),
    onSuccess: () => {
      setName('')
      setEmail('')
      void queryClient.invalidateQueries({ queryKey: journalistQueryKeys.all })
    },
  })

  return (
    <DarkFormCard
      title="Créer un journaliste"
      description="Formulaire directeur pour provisionner un acteur journaliste."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <DarkInput
          label="Nom"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <DarkInput
          label="E-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        {mutation.isError ? (
          <Notice tone="error">{toApiErrorMessage(mutation.error)}</Notice>
        ) : null}
        {mutation.isSuccess ? (
          <Notice tone="success">Journaliste créé.</Notice>
        ) : null}
        <div>
          <DarkButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Création...' : 'Créer le journaliste'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
