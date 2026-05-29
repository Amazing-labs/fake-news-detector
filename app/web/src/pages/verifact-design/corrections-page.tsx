import { Button } from '../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import { Input } from '../../shared/ui/shadcn/input'
import { Label } from '../../shared/ui/shadcn/label'
import { Textarea } from '../../shared/ui/shadcn/textarea'
import { AppLayout } from './app-layout'

export function CorrectionsPage() {
  return (
    <AppLayout actor="director" page="correction">
      <Card>
        <CardHeader>
          <CardTitle>Correctif</CardTitle>
          <CardDescription>
            Associe la publication et rédige la note.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="publication">Publication</Label>
            <Input id="publication" placeholder="Titre ou référence publique" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="correction">Correction</Label>
            <Textarea
              id="correction"
              placeholder="Explique le correctif à publier"
            />
          </div>
          <Button className="w-fit">Préparer le correctif</Button>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
