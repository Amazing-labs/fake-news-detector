import { Link } from '@tanstack/react-router'
import { useAppSession } from '../../entities/session/model'
import { getNavigationForSession } from '../../shared/session/role-access'
import { EmptyState, PlatformBreadcrumb } from '../../shared/ui/primitives'

export function ProfilePage() {
  const { session, isPending } = useAppSession()

  if (isPending) {
    return (
      <EmptyState
        title="Chargement"
        description="Le frontend attend la session Better Auth."
      />
    )
  }

  if (!session) {
    return (
      <EmptyState
        title="Aucune session"
        description="Connecte-toi pour retrouver ton espace de travail."
      />
    )
  }

  const quickLinks = getNavigationForSession(session).filter(
    (item) => item.to !== '/profile',
  )

  return (
    <section className="rounded-[1.8rem] border border-[#ece7df] bg-white/78 p-5 shadow-[0_18px_60px_rgba(33,28,23,0.045)] backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <PlatformBreadcrumb section="profile" />
          <h2 className="mt-1 text-xl font-black tracking-[-0.035em] text-[#171514]">
            Pages utiles pour ton role
            <span className="font-editorial">.</span>
          </h2>
        </div>
        <p className="text-sm text-[#706a63]">
          {quickLinks.length} espaces disponibles
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="rounded-[1.2rem] border border-[#eee9e2] bg-[#fbfaf8] p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_42px_rgba(33,28,23,0.08)]"
          >
            <p className="text-sm font-black text-[#171514]">{item.label}</p>
            <p className="mt-2 text-xs leading-5 text-[#706a63]">
              Ouvrir cet espace de travail.
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
