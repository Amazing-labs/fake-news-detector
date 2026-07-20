import { Link } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@shared/ui/shadcn/button'
import { Input } from '@shared/ui/shadcn/input'
import { Label } from '@shared/ui/shadcn/label'
import {
  requestPasswordReset,
  resetPassword,
  signInWithEmail,
  signUpWithEmail,
} from './auth-process'

type AuthFormProps = {
  onModeChange: (mode: 'sign-in' | 'sign-up' | 'forgot-password') => void
}

function PasswordField(props: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: 'current-password' | 'new-password'
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="grid gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <div className="relative">
        <Input
          id={props.id}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder="••••••••"
          type={visible ? 'text' : 'password'}
          className="pr-10"
          autoComplete={props.autoComplete}
          required
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex items-center rounded-md px-3 focus-visible:ring-[3px] focus-visible:outline-none"
          aria-label={
            visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export function SignInForm({ onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    try {
      await signInWithEmail(email, password)
      toast.success('Session ouverte.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Connexion impossible.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="sign-in-email">Email</Label>
        <Input
          id="sign-in-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <PasswordField
        id="sign-in-password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      <div className="flex justify-end">
        <Link
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
          to="/auth"
          search={{ mode: 'forgot-password' }}
        >
          Mot de passe oublié ?
        </Link>
      </div>
      <Button className="h-11 w-full" loading={pending} type="submit">
        Se connecter
      </Button>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground w-full text-sm"
        onClick={() => onModeChange('sign-up')}
      >
        Créer un compte
      </button>
    </form>
  )
}

export function SignUpForm({ onModeChange }: AuthFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    try {
      await signUpWithEmail(name, email, password)
      toast.success('Compte créé. Session ouverte.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Inscription impossible.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="sign-up-name">Nom</Label>
        <Input
          id="sign-up-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sign-up-email">Email</Label>
        <Input
          id="sign-up-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <PasswordField
        id="sign-up-password"
        label="Mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <Button className="h-11 w-full" loading={pending} type="submit">
        Créer mon compte
      </Button>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground w-full text-sm"
        onClick={() => onModeChange('sign-in')}
      >
        J’ai déjà un compte
      </button>
    </form>
  )
}

export function ForgotPasswordForm({ onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    try {
      await requestPasswordReset(
        email,
        `${window.location.origin}/auth?mode=reset-password`,
      )
      toast.success(
        import.meta.env.DEV
          ? 'Le lien de réinitialisation a été écrit dans le terminal du serveur.'
          : 'La réinitialisation par e-mail n’est pas encore disponible.',
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Demande impossible.',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <p className="text-muted-foreground text-sm">
        {import.meta.env.DEV
          ? 'Saisissez votre email. En développement, le lien de réinitialisation est affiché dans le terminal du serveur.'
          : 'La réinitialisation par e-mail n’est pas encore disponible.'}
      </p>
      <div className="grid gap-2">
        <Label htmlFor="forgot-password-email">Email</Label>
        <Input
          id="forgot-password-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <Button className="h-11 w-full" loading={pending} type="submit">
        Générer le lien
      </Button>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground w-full text-sm"
        onClick={() => onModeChange('sign-in')}
      >
        Retour à la connexion
      </button>
    </form>
  )
}

export function ResetPasswordForm({
  token,
  onModeChange,
}: AuthFormProps & { token?: string }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    if (password !== confirmation) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    setPending(true)
    try {
      await resetPassword(password, token)
      toast.success('Mot de passe réinitialisé. Vous pouvez vous connecter.')
      onModeChange('sign-in')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Réinitialisation impossible.',
      )
    } finally {
      setPending(false)
    }
  }

  if (!token) {
    return (
      <p className="text-muted-foreground text-sm">
        Le lien de réinitialisation est invalide ou expiré.
      </p>
    )
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <PasswordField
        id="reset-password"
        label="Nouveau mot de passe"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
      />
      <PasswordField
        id="reset-password-confirmation"
        label="Confirmer le mot de passe"
        value={confirmation}
        onChange={setConfirmation}
        autoComplete="new-password"
      />
      <Button className="h-11 w-full" loading={pending} type="submit">
        Réinitialiser le mot de passe
      </Button>
    </form>
  )
}
