import { Eye, PenTool, ShieldCheck, UserRoundCheck } from 'lucide-react'
import type { ComponentType } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/shadcn/card'
import type { PublicationDossier } from '@entities/publication/model'

type Credit = {
  icon: ComponentType<{ className?: string }>
  role: string
  names: string
  blurb: string
}

/**
 * Who answers for this publication. Named on purpose — a verdict without a
 * signature is just an opinion. The citizen who filed the originating report is
 * deliberately absent: the payload carries no identity for them at all.
 */
export function PublicationCredits({
  credits,
}: {
  credits: PublicationDossier['credits']
}) {
  const entries: Credit[] = []

  if (credits.watcherNames.length > 0) {
    entries.push({
      icon: Eye,
      role:
        credits.watcherNames.length > 1
          ? 'Vigies contributrices'
          : 'Vigie contributrice',
      names: credits.watcherNames.join(', '),
      blurb:
        'Sur le terrain avant tout le monde. Elles ont versé des pièces au dossier et documenté ce que les sources officielles ne disaient pas encore.',
    })
  }

  if (credits.journalistName) {
    entries.push({
      icon: PenTool,
      role: 'Enquêteur · journaliste spécialiste',
      names: credits.journalistName,
      blurb:
        'A recoupé chaque pièce une par une, tranché sa fiabilité et motivé le verdict. La note d’enquête, c’est sa signature.',
    })
  }

  if (credits.directorName) {
    entries.push({
      icon: ShieldCheck,
      role: 'Directeur de publication',
      names: credits.directorName,
      blurb:
        'A piloté l’arbitrage et endosse l’entière responsabilité de ce verdict devant le public — y compris de ses conséquences sociales et économiques.',
    })
  }

  if (entries.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Qui répond de cette publication
        </CardTitle>
        <CardDescription>
          Une vérification n’est crédible que si quelqu’un la signe.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-3">
        {entries.map((entry) => {
          const Icon = entry.icon
          return (
            <div
              key={entry.role}
              className="bg-muted/30 border-border/60 grid gap-2 rounded-xl border p-4"
            >
              <span className="bg-background text-muted-foreground grid size-9 place-items-center rounded-lg">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {entry.role}
                </p>
                <p className="mt-0.5 font-medium tracking-tight">
                  {entry.names}
                </p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                {entry.blurb}
              </p>
            </div>
          )
        })}
        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed lg:col-span-3">
          <UserRoundCheck className="mt-px size-3.5 shrink-0" />
          Le citoyen à l’origine du signalement reste anonyme : son identité ne
          quitte jamais la rédaction.
        </p>
      </CardContent>
    </Card>
  )
}
