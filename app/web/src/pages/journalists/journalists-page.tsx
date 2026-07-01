import { PeopleManagementPage } from '../verifact-design/verifact-design-page'
import { AppLayout } from '../verifact-design/app-layout'
import { CreateJournalistForm } from '@features/journalists/create-journalist-form'

export function JournalistsListPage() {
  return <PeopleManagementPage />
}

export function JournalistCreatePage() {
  return (
    <AppLayout actor="director" page="people">
      <CreateJournalistForm />
    </AppLayout>
  )
}
