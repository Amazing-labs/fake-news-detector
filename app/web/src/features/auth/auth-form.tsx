import { useEffect, useState } from 'react'
import { authClient } from '../../lib/auth-client'
import { Button, Input, Notice, SectionCard } from '../../shared/ui/primitives'

export function AuthForm(props: {
  initialMode?: 'sign-in' | 'sign-up'
  onSuccess?: () => void | Promise<void>
}) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(
    props.initialMode ?? 'sign-in',
  )
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setMode(props.initialMode ?? 'sign-in')
  }, [props.initialMode])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'sign-up') {
        const result = await authClient.signUp.email({
          name,
          email,
          password,
        })

        if (result.error) {
          setError(result.error.message ?? 'Inscription impossible')
          return
        }

        setSuccess('Compte cree et session ouverte.')
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        })

        if (result.error) {
          setError(result.error.message ?? 'Connexion impossible')
          return
        }

        setSuccess('Connexion reussie.')
      }

      await props.onSuccess?.()
      setPassword('')
    } finally {
      setPending(false)
    }
  }

  return (
    <SectionCard
      title="Authentification"
      description="Connexion et inscription Better Auth pour tester les workflows backend."
    >
      <div className="flex gap-2">
        <Button
          variant={mode === 'sign-in' ? 'primary' : 'secondary'}
          onClick={() => setMode('sign-in')}
        >
          Connexion
        </Button>
        <Button
          variant={mode === 'sign-up' ? 'primary' : 'secondary'}
          onClick={() => setMode('sign-up')}
        >
          Inscription
        </Button>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        {mode === 'sign-up' ? (
          <Input
            label="Nom"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Awa Traore"
          />
        ) : null}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="awa@example.com"
        />

        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Au moins 8 caracteres"
        />

        {error ? <Notice tone="error">{error}</Notice> : null}
        {success ? <Notice tone="success">{success}</Notice> : null}

        <Button type="submit" disabled={pending}>
          {pending
            ? 'En cours...'
            : mode === 'sign-up'
              ? 'Creer un compte'
              : 'Se connecter'}
        </Button>
      </form>
    </SectionCard>
  )
}
