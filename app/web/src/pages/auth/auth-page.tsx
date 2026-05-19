import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAppSession } from '../../entities/session/model'
import { AuthForm } from '../../features/auth/auth-form'
import { EmptyState } from '../../shared/ui/primitives'

const authHighlights = [
  'Session securisee par cookie HTTP',
  'Espace adapte au role metier',
  'Navigation reduite aux pages utiles',
]

export function AuthPage(props: { initialMode?: 'sign-in' | 'sign-up' }) {
  const { session, isPending, refetch } = useAppSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isPending && session) {
      void navigate({ to: '/profile', replace: true })
    }
  }, [isPending, navigate, session])

  async function handleAuthSuccess() {
    await refetch()
    await navigate({ to: '/profile' })
  }

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#171514]">
      <header className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-4">
        <span className="text-sm font-black text-[#85807a]">
          Acces securise
        </span>
        <Link
          to="/"
          className="rounded-full border border-[#e4ded5] bg-white px-4 py-2 text-sm font-black text-[#171514] hover:bg-[#faf8f5]"
        >
          Retour
        </Link>
      </header>

      <main className="mx-auto grid max-w-[960px] gap-8 px-4 py-8 lg:grid-cols-[1fr_420px] lg:items-start">
        <section className="max-w-2xl">
          <p className="text-sm font-black text-[#85807a]">
            Fake News Detector / <span className="text-[#1d78c1]">auth</span>
          </p>
          <h1 className="mt-4 text-5xl leading-[0.98] font-extrabold tracking-[-0.06em] text-[#171514] md:text-6xl">
            Espace <span className="font-editorial">verification.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#706a63]">
            Une seule connexion, puis l'application affiche uniquement les
            ecrans utiles a ton role.
          </p>

          <div className="mt-7 overflow-hidden rounded-[1.35rem] border border-[#ece7df] bg-white shadow-[0_18px_70px_rgba(33,28,23,0.06)]">
            {authHighlights.map((item) => (
              <div
                key={item}
                className="border-b border-[#eee9e2] px-5 py-4 text-sm font-bold text-[#706a63] last:border-b-0"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          {isPending ? (
            <EmptyState
              title="Session en cours"
              description="Le frontend attend le retour de Better Auth avant d'afficher l'interface de connexion."
            />
          ) : session ? (
            <EmptyState
              title="Session active"
              description="Tu es deja connecte. Redirection vers ton espace de travail."
            />
          ) : (
            <AuthForm
              initialMode={props.initialMode}
              onSuccess={handleAuthSuccess}
            />
          )}
        </section>
      </main>
    </div>
  )
}
