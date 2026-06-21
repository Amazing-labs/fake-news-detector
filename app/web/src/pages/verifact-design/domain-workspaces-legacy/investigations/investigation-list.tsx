import { Link } from '@tanstack/react-router'
import { Button } from '../../../../shared/ui/shadcn/button'
import { slugifyLabel } from '../utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../shared/ui/shadcn/card'
import { investigations } from '../../workspace-mocks'
import { StatusBadge } from '../../workspace-ui'

export function InvestigationList({ status }: { status: string }) {
  const rows = investigations.filter((item) => item.status === status)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des enquêtes</CardTitle>
        <CardDescription>
          Le détail contient les actions de publication, rejet et archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length ? (
          rows.map((item) => (
            <div
              key={item.title}
              className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.journalist} · {item.category} · {item.evidence}
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link
                  to="/investigations/$investigationId"
                  params={{ investigationId: slugifyLabel(item.title) }}
                >
                  Voir le détail
                </Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Aucun dossier pour ce filtre</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Les enquêtes apparaîtront ici quand leur statut changera.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
