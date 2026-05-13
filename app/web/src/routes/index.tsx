import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from '../pages/auth/auth-page'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AuthPage />
}
