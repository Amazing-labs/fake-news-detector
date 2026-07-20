import { Link } from '@tanstack/react-router'
import { ShieldCheck, Flag, Eye, BadgeCheck } from 'lucide-react'
/**
 * @module
 * Editorial brand panel shown beside the auth form on large screens.
 */
export function AuthHero() {
  return (
    <aside className="bg-card text-card-foreground relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: 'oklch(0.72 0.15 162)' }}
      />

      <Link to="/" className="relative flex items-center gap-2">
        <ShieldCheck className="size-5" />
        <span className="font-semibold tracking-tight">Fake News Detector</span>
      </Link>

      <div className="relative max-w-md">
        <h2 className="text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] text-balance">
          <span className="font-ui font-bold tracking-tight">
            Le citoyen tient
          </span>{' '}
          <span className="font-editorial text-[1.1em]">le premier rôle.</span>
        </h2>
        <p className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty">
          Un compte suffit pour signaler, enquêter et suivre chaque verdict
          jusqu'à ses sources.
        </p>

        <ul className="mt-8 space-y-4">
          {HERO_POINTS.map((point) => (
            <li key={point.label} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-white"
                style={{ background: 'oklch(0.72 0.15 162)' }}
              >
                <point.icon className="size-4" />
              </span>
              <span className="leading-relaxed">
                <span className="font-medium">{point.label}</span>{' '}
                <span className="text-muted-foreground">{point.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-muted-foreground relative text-sm">
        Vérifier l'information, ensemble.
      </p>
    </aside>
  )
}

export const HERO_POINTS = [
  {
    icon: Flag,
    label: 'Signalez.',
    body: 'Déposez un contenu suspect et suivez son enquête.',
  },
  {
    icon: Eye,
    label: 'Devenez vigie.',
    body: 'Apportez des preuves aux enquêtes en cours.',
  },
  {
    icon: BadgeCheck,
    label: 'Suivez les verdicts.',
    body: 'Chaque conclusion, justifiée par ses sources.',
  },
] as const
