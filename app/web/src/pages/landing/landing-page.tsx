import { Link } from '@tanstack/react-router'
import Lenis from 'lenis'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useEffect } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  FileSearch,
  Flag,
  Moon,
  Scale,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { Button } from '@shared/ui/shadcn/button'
import { useTheme } from '../verifact-design/theme'

/**
 * Public landing page shown to unauthenticated visitors at `/`. Preserves the
 * shipped identity — warm ivory / neutral-dark tokens, Instrument Serif display,
 * Manrope UI — and elevates it with orchestrated motion and a citizen-first CTA.
 */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', duration: 0.7, bounce: 0 },
  },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const EMERALD = 'oklch(0.72 0.15 162)'

export function LandingPage() {
  const { isDark, setIsDark } = useTheme()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reduce])

  const revealOnScroll = {
    variants: stagger,
    initial: reduce ? false : ('hidden' as const),
    whileInView: 'show' as const,
    viewport: { once: true, margin: '-80px' },
  }

  return (
    <div className="bg-background text-foreground font-ui min-h-screen antialiased">
      <SiteHeader isDark={isDark} onToggleTheme={() => setIsDark((v) => !v)} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute -top-32 left-1/2 h-152 w-152 -translate-x-1/2 rounded-full opacity-[0.14] blur-3xl"
              style={{ background: EMERALD }}
            />
          </div>

          <div className="mx-auto grid max-w-6xl gap-14 px-5 pt-16 pb-20 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:pb-28">
            <motion.div
              variants={stagger}
              initial={reduce ? false : 'hidden'}
              animate="show"
            >
              <motion.span
                variants={fadeUp}
                className="border-border/70 bg-card/60 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm shadow-sm"
              >
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ background: EMERALD }}
                />
                Vérification collaborative de l'information
              </motion.span>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.98] text-balance"
              >
                <span className="font-ui font-extrabold tracking-tight">
                  Séparer le vrai du faux,
                </span>{' '}
                <span className="font-editorial text-[1.08em]">
                  ensemble et à découvert.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed text-pretty"
              >
                Signalez un contenu suspect, suivez l'enquête menée par des
                journalistes, et voyez chaque verdict justifié par ses sources.
                Une rédaction ouverte où le citoyen tient le premier rôle.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Button
                  size="lg"
                  className="h-11 gap-2 px-6 text-base transition-transform active:scale-[0.97]"
                  asChild
                >
                  <Link to="/auth" search={{ mode: 'sign-up' }}>
                    Créer un compte citoyen
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 text-base transition-transform active:scale-[0.97]"
                  asChild
                >
                  <Link to="/auth" search={{ mode: 'sign-in' }}>
                    Se connecter
                  </Link>
                </Button>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="text-muted-foreground mt-6 flex items-center gap-2 text-sm"
              >
                <ShieldCheck className="size-4" style={{ color: EMERALD }} />
                Gratuit — aucune carte requise. Vous gardez la main sur vos
                signalements.
              </motion.p>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                duration: 0.9,
                bounce: 0,
                delay: 0.15,
              }}
            >
              <VerdictCard />
            </motion.div>
          </div>
        </section>

        {/* Workflow */}
        <section id="methode" className="border-border/60 border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <motion.div {...revealOnScroll} className="max-w-2xl">
              <motion.h2
                variants={fadeUp}
                className="text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-balance"
              >
                <span className="font-ui font-bold tracking-tight">
                  De l'alerte à la preuve publiée.
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty"
              >
                Quatre étapes, un fil conducteur. Chaque contenu douteux suit le
                même parcours traçable jusqu'au verdict.
              </motion.p>
            </motion.div>

            <motion.ol
              {...revealOnScroll}
              className="mt-14 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4"
              style={{ background: 'var(--border)' }}
            >
              {WORKFLOW.map((step, index) => (
                <motion.li
                  key={step.title}
                  variants={fadeUp}
                  className="bg-card relative p-6"
                >
                  <div className="text-muted-foreground/70 flex items-center justify-between">
                    <step.icon className="size-5" />
                    <span className="font-editorial text-2xl tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* Citizen value */}
        <section className="border-border/60 border-t">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <motion.div {...revealOnScroll}>
              <motion.p
                variants={fadeUp}
                className="font-editorial text-muted-foreground text-2xl"
              >
                Votre rôle
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-3 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-balance"
              >
                <span className="font-ui font-bold tracking-tight">
                  Le citoyen n'assiste pas. Il enquête.
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-muted-foreground mt-5 text-lg leading-relaxed text-pretty"
              >
                Un compte suffit pour agir. Plus vous contribuez, plus vous
                gagnez en responsabilités — jusqu'à devenir vigie et appuyer
                directement les enquêtes.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8">
                <Button
                  size="lg"
                  className="h-11 gap-2 px-6 text-base transition-transform active:scale-[0.97]"
                  asChild
                >
                  <Link to="/auth" search={{ mode: 'sign-up' }}>
                    Rejoindre la vérification
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div {...revealOnScroll} className="grid gap-4">
              {CITIZEN.map((item) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="bg-card flex gap-4 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
                >
                  <span
                    className="text-muted-foreground grid size-11 shrink-0 place-items-center rounded-xl"
                    style={{
                      background:
                        'color-mix(in oklab, var(--foreground) 6%, transparent)',
                    }}
                  >
                    <item.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Method / safeguards */}
        <section className="border-border/60 border-t">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <motion.div {...revealOnScroll} className="max-w-2xl">
              <motion.h2
                variants={fadeUp}
                className="text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-balance"
              >
                <span className="font-ui font-bold tracking-tight">
                  Une méthode, pas une opinion.
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-muted-foreground mt-4 text-lg leading-relaxed text-pretty"
              >
                Chaque verdict s'appuie sur des garde-fous explicites. La
                confiance se construit, elle ne se décrète pas.
              </motion.p>
            </motion.div>

            <motion.div
              {...revealOnScroll}
              className="mt-12 grid gap-6 md:grid-cols-3"
            >
              {METHOD.map((item) => (
                <motion.div key={item.title} variants={fadeUp}>
                  <item.icon className="size-6" style={{ color: EMERALD }} />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-20 sm:py-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0 }}
            className="bg-primary text-primary-foreground relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-20"
          >
            <div
              className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full opacity-20 blur-3xl"
              style={{ background: EMERALD }}
            />
            <h2 className="mx-auto max-w-2xl text-[clamp(2rem,4vw,3.25rem)] leading-tight text-balance">
              <span className="font-editorial text-[1.1em]">
                Prêt à défendre l'information ?
              </span>
            </h2>
            <p className="text-primary-foreground/80 mx-auto mt-5 max-w-xl text-lg leading-relaxed text-pretty">
              Rejoignez les citoyens qui transforment le doute en preuves
              vérifiables.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="h-11 gap-2 px-6 text-base transition-transform active:scale-[0.97]"
                asChild
              >
                <Link to="/auth" search={{ mode: 'sign-up' }}>
                  Créer un compte citoyen
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function SiteHeader(props: { isDark: boolean; onToggleTheme: () => void }) {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="size-5" />
          <span className="font-semibold tracking-tight">
            Fake News Detector
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={props.onToggleTheme}
            aria-label={props.isDark ? 'Passer en clair' : 'Passer en sombre'}
            className="text-muted-foreground hover:text-foreground hover:bg-accent grid size-10 place-items-center rounded-lg transition-colors active:scale-[0.94]"
          >
            {props.isDark ? (
              <Sun className="size-[1.15rem]" />
            ) : (
              <Moon className="size-[1.15rem]" />
            )}
          </button>
          <Button
            variant="ghost"
            className="hidden h-10 px-4 transition-transform active:scale-[0.97] sm:inline-flex"
            asChild
          >
            <Link to="/auth" search={{ mode: 'sign-in' }}>
              Se connecter
            </Link>
          </Button>
          <Button
            className="h-10 px-4 transition-transform active:scale-[0.97]"
            asChild
          >
            <Link to="/auth" search={{ mode: 'sign-up' }}>
              Créer un compte
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="border-border/60 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          <span className="text-foreground font-medium">
            Fake News Detector
          </span>
        </div>
        <p>Vérifier l'information, ensemble.</p>
      </div>
    </footer>
  )
}

/** Composed product visual: a claim resolving into a justified verdict. */
function VerdictCard() {
  return (
    <div className="bg-card relative mx-auto max-w-md rounded-3xl p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_24px_60px_-24px_rgba(0,0,0,0.28)]">
      <div className="border-border/70 rounded-[1.15rem] border p-5">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <FileSearch className="size-3.5" />
            Dossier #2048
          </span>
          <span className="tabular-nums">Enquête close</span>
        </div>

        <p className="text-foreground mt-4 text-lg leading-snug font-semibold tracking-tight text-pretty">
          « La vidéo montre une manifestation d'hier dans la capitale. »
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {['3 médias', '2 sources', 'Recoupé'].map((chip) => (
            <span
              key={chip}
              className="border-border/70 text-muted-foreground rounded-full border px-2.5 py-1 text-xs"
            >
              {chip}
            </span>
          ))}
        </div>

        <div
          className="mt-6 flex items-center gap-3 rounded-2xl p-4"
          style={{
            background:
              'color-mix(in oklab, oklch(0.72 0.15 162) 12%, transparent)',
          }}
        >
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full text-white"
            style={{ background: EMERALD }}
          >
            <BadgeCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: EMERALD }}>
              Vérifié — trompeur
            </p>
            <p className="text-muted-foreground text-xs">
              Images authentiques, sorties de leur contexte d'origine.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const WORKFLOW = [
  {
    icon: Flag,
    title: 'Signalement',
    body: 'Un citoyen dépose un contenu suspect avec ses médias et son contexte.',
  },
  {
    icon: FileSearch,
    title: 'Sujet éditorial',
    body: 'Le signalement entre dans la file de la rédaction, prêt à être traité.',
  },
  {
    icon: Eye,
    title: 'Enquête',
    body: 'Un journaliste classe chaque média, croise les sources, forme un avis.',
  },
  {
    icon: BadgeCheck,
    title: 'Publication',
    body: 'La direction arbitre, puis publie un verdict justifié — ou archive.',
  },
] as const

const CITIZEN = [
  {
    icon: Flag,
    title: 'Déposer un signalement',
    body: "Soumettez un contenu douteux en quelques minutes et suivez l'avancée de l'enquête.",
  },
  {
    icon: Eye,
    title: 'Devenir vigie',
    body: 'Candidatez pour apporter des preuves directement aux enquêtes en cours.',
  },
  {
    icon: BadgeCheck,
    title: 'Suivre les verdicts',
    body: "Soyez notifié dès qu'une publication ou une correction vous concerne.",
  },
] as const

const METHOD = [
  {
    icon: Scale,
    title: 'Médias classés par origine',
    body: 'Chaque preuve porte sa provenance : signalement citoyen, apport de vigie ou source du journaliste.',
  },
  {
    icon: ShieldCheck,
    title: "Sources d'autorité",
    body: "Les preuves du journaliste s'adossent à une source qualifiée, jamais à une simple affirmation.",
  },
  {
    icon: BadgeCheck,
    title: 'Arbitrage éditorial',
    body: 'La direction valide, renvoie en correction ou archive. Aucun verdict ne se publie seul.',
  },
] as const
