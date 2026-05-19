import { Link } from '@tanstack/react-router'
import { useAppSession } from '../../entities/session/model'

const notes = [
  {
    author: 'Awa Diarra',
    desk: 'Bureau des alertes',
    avatar: 'AD',
    context: 'Sur une video virale',
    body: 'La sequence circule sans date. On a retrouve la publication originale: elle vient de 2022.',
    time: '8:14 AM',
    stat: '12',
    replies: '3 retours',
    tone: 'from-[#fff5d6] to-[#ffe8ef]',
  },
  {
    author: 'Malik Sissoko',
    desk: 'Cellule preuves',
    avatar: 'MS',
    context: 'Dossier en revue',
    body: 'Deux sources confirment le lieu. Le media est bon, mais la legende inverse le contexte.',
    time: '9:42 AM',
    stat: '8',
    replies: 'Lire la note',
    tone: 'from-[#e9f6ff] to-[#f7fbff]',
  },
  {
    author: 'Nora Kante',
    desk: 'Registre public',
    avatar: 'NK',
    context: 'Correction publique',
    body: 'Verdict prepare. Le rectificatif explique ce qui est vrai, ce qui manque, et pourquoi.',
    time: '11:05 AM',
    stat: '19',
    replies: 'Publier',
    tone: 'from-[#edf8ef] to-[#fffdf6]',
  },
  {
    author: 'Ibrahima Traore',
    desk: 'Redaction locale',
    avatar: 'IT',
    context: 'Source citoyenne',
    body: 'Le signalement est utile: capture, URL, heure locale. Il part en qualification.',
    time: '1:28 PM',
    stat: '6',
    replies: '1 commentaire',
    tone: 'from-[#fff0ef] to-[#fbfaf8]',
  },
  {
    author: 'Fatou Camara',
    desk: 'Equipe enquete',
    avatar: 'FC',
    context: 'Recoupement',
    body: 'La photo existe bien, mais elle documente une autre manifestation. On garde la source, pas la conclusion.',
    time: '3:36 PM',
    stat: '15',
    replies: 'Verifier',
    tone: 'from-[#f0f4ff] to-[#fff]',
  },
  {
    author: 'Redaction',
    desk: 'Synthese editoriale',
    avatar: 'FN',
    context: 'Synthese',
    body: 'Chaque dossier garde une trace lisible: alerte, preuve, arbitrage, correction.',
    time: 'Maintenant',
    stat: '24',
    replies: 'Ouvrir',
    tone: 'from-[#fff7e8] to-[#edf7ff]',
  },
]

function NoteCard(props: { note: (typeof notes)[number] }) {
  return (
    <article className="mx-auto w-full max-w-[540px] break-inside-avoid rounded-[1.65rem] border border-[#ece7df] bg-white p-5 shadow-[0_14px_38px_rgba(33,28,23,0.055)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#eee9e2] pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${props.note.tone} text-sm font-black text-[#171514] ring-1 ring-[#e8e2da]`}
          >
            {props.note.avatar}
          </div>
          <div className="min-w-0">
            <p className="truncate font-black tracking-[-0.02em] text-[#171514]">
              {props.note.author}
            </p>
            <p className="truncate text-sm text-[#85807a]">{props.note.desk}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#faf8f5] px-3 py-1 text-xs font-black text-[#85807a]">
          {props.note.time}
        </span>
      </div>

      <div className="pt-4">
        <span className="inline-flex rounded-full bg-[#f5f2ee] px-3 py-1 text-xs font-black text-[#706a63]">
          {props.note.context}
        </span>
        <p className="mt-4 text-[1.25rem] leading-7 tracking-[-0.02em] text-[#211d1a]">
          {props.note.body}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#eee9e2] pt-4 text-sm font-black text-[#77716b]">
        <span>{props.note.stat} elements verifies</span>
        <span>{props.note.replies}</span>
      </div>
    </article>
  )
}

function FooterGroup(props: { title: string; links: string[] }) {
  return (
    <nav>
      <h2 className="text-sm font-black text-[#171514]">{props.title}</h2>
      <ul className="mt-3 grid gap-2 text-sm font-bold text-[#706a63]">
        {props.links.map((link) => (
          <li key={link}>
            <a href="#notes" className="hover:text-[#171514]">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function LandingPage() {
  const { session, isPending } = useAppSession()

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#171514]">
      <header className="pointer-events-none sticky top-3 z-30 mx-3 flex items-center justify-between gap-2 sm:mx-5">
        <div className="pointer-events-auto hidden items-center gap-2 rounded-full bg-[#171514] px-4 py-2 text-sm font-black text-white md:flex">
          <span>24 notes</span>
          <span className="h-2 w-2 rounded-full bg-[#f8d66d]" />
        </div>

        <div className="pointer-events-auto ml-auto flex items-center gap-1.5 rounded-[1.35rem] border border-[#e9e3da] bg-white/95 p-1.5 shadow-[0_10px_28px_rgba(30,24,18,0.1)] sm:gap-2">
          {isPending ? (
            <span className="rounded-full px-4 py-2 text-sm font-black text-[#85807a]">
              ...
            </span>
          ) : session ? (
            <Link
              to="/profile"
              className="rounded-full bg-[#171514] px-4 py-2 text-sm font-black text-white hover:bg-[#2d2926]"
            >
              Entrer
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: 'sign-in' }}
                className="rounded-full px-3 py-2 text-sm font-black text-[#171514] hover:bg-[#f5f2ee] sm:px-4"
              >
                Connexion
              </Link>
              <Link
                to="/auth"
                search={{ mode: 'sign-up' }}
                className="rounded-full bg-[#171514] px-3 py-2 text-sm font-black text-white hover:bg-[#2d2926] sm:px-4"
              >
                Inscription
              </Link>
            </>
          )}
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e4ded5] bg-white"
            aria-label="Menu"
          >
            <span className="grid gap-1">
              <span className="block h-0.5 w-4 rounded-full bg-[#171514]" />
              <span className="block h-0.5 w-4 rounded-full bg-[#171514]" />
              <span className="block h-0.5 w-4 rounded-full bg-[#171514]" />
            </span>
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1280px] px-4 pt-16 pb-16">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black text-[#85807a]">
            Des preuves courtes, lisibles, partageables.
          </p>
          <h1 className="mt-4 text-5xl leading-[0.95] font-extrabold tracking-[-0.065em] text-[#171514] md:text-7xl">
            Current <span className="font-editorial">notes.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#706a63]">
            Fake News Detector transforme chaque rumeur en note claire:
            contexte, source, preuve, decision et correction.
          </p>
        </section>

        <section
          id="notes"
          className="mx-auto mt-12 grid w-full max-w-[920px] justify-items-center gap-5 md:grid-cols-2"
        >
          {notes.slice(0, 4).map((note) => (
            <NoteCard key={`${note.author}-${note.time}`} note={note} />
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-[1160px] px-4 pb-8">
        <div className="rounded-[1.65rem] border border-[#ece7df] bg-white/90 p-6 shadow-[0_14px_38px_rgba(33,28,23,0.045)]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <p className="max-w-sm text-sm leading-6 text-[#706a63]">
                Une plateforme pour aider les redactions a qualifier les
                rumeurs, documenter les preuves et publier des corrections
                lisibles.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <FooterGroup
                title="Produit"
                links={[
                  'Notes',
                  'Dossiers',
                  'Registre public',
                  'Tableau editorial',
                ]}
              />
              <FooterGroup
                title="Ressources"
                links={['Blog', 'Guides', 'Documentation', "Centre d'aide"]}
              />
              <FooterGroup
                title="Entreprise"
                links={['A propos de nous', 'Equipe', 'Contact', 'Presse']}
              />
              <FooterGroup
                title="Legal"
                links={['Confidentialite', 'Conditions', 'Securite', 'Cookies']}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-[#eee9e2] pt-4 text-xs font-bold text-[#918a83]">
            <span>2026 / Fake News Detector. Tous droits reserves.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
