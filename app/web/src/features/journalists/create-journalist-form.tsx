import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createJournalist,
  journalistQueryKeys,
} from '../../entities/journalist/api'
import { toApiErrorMessage } from '../../shared/api/http'
import { Button, Input, Notice, SectionCard } from '../../shared/ui/primitives'

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
    <SectionCard
      title="Créer un journaliste"
      description="Formulaire directeur pour provisionner un acteur journaliste."
    >
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Input
          label="Nom"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
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
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Création...' : 'Créer le journaliste'}
        </Button>
      </form>
    </SectionCard>
  )
}
