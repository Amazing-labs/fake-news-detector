import { createFileRoute } from '@tanstack/react-router'
import { CitizenPage } from '../pages/citizen/citizen-page'

export const Route = createFileRoute('/citizen')({
  component: CitizenRoute,
})

function CitizenRoute() {
  return <CitizenPage />
}
