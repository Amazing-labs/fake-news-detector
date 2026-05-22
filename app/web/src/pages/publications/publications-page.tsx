import {
  CorrectionsPage,
  VeriFactDirectorDashboardPage,
} from '../verifact-design/verifact-design-page'

export function PublicationsPage() {
  return <VeriFactDirectorDashboardPage />
}

export function PublicationsListPage() {
  return <VeriFactDirectorDashboardPage />
}

export function PublicationCorrectionsPage(_props: { publicationId?: string }) {
  void _props
  return <CorrectionsPage />
}
