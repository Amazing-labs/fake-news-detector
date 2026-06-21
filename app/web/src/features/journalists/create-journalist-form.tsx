import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createJournalist,
  journalistQueryKeys,
} from '@entities/journalist/api'
import { toApiErrorMessage } from '@shared/api/http'
import { DarkButton, DarkFormCard, DarkInput } from '@shared/ui/dark-form'

export function CreateJournalistForm() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createJournalist({
        name: name.trim(),
        email: email.trim(),
      }),
    onSuccess: () => {
      setName('')
      setEmail('')
      toast.success('Journaliste créé.')
      void queryClient.invalidateQueries({ queryKey: journalistQueryKeys.all })
    },
    onError: (error) => {
      toast.error(toApiErrorMessage(error))
    },
  })

  function handleSubmit() {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (trimmedName.length < 2) {
      toast.error('Renseigne un nom de journaliste valide.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Renseigne une adresse e-mail valide.')
      return
    }

    mutation.mutate()
  }

  return (
    <DarkFormCard
      title="Créer un journaliste"
      description="Formulaire directeur pour provisionner un acteur journaliste."
    >
      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
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
        <div>
          <DarkButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Création...' : 'Créer le journaliste'}
          </DarkButton>
        </div>
      </form>
    </DarkFormCard>
  )
}
