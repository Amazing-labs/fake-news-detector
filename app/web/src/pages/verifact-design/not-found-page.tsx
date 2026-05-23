import { Link } from '@tanstack/react-router'
import { CircleHelp } from 'lucide-react'
import { Button } from '../../shared/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../shared/ui/shadcn/card'
import { useTheme } from './theme'

export function NotFoundPage() {
  useTheme()

  return (
    <div className="bg-background text-foreground grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-xl text-center">
        <CardHeader>
          <CardTitle className="text-5xl">404</CardTitle>
          <CardDescription>
            Cette route n'existe pas dans le desk de verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <CircleHelp className="text-muted-foreground size-10" />
          <p className="text-muted-foreground text-sm">
            Reviens au tableau de bord pour continuer le flux de travail.
          </p>
          <Button asChild>
            <Link to="/dashboard">Retour au dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
