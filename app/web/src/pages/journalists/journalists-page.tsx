import {
  VeriFactGenericPage,
  VeriFactJournalistDashboardPage,
  VeriFactProfilePage,
} from '../verifact-design/verifact-design-page'

export function JournalistsListPage() {
  return (
    <VeriFactGenericPage
      title="Experts"
      description="Static experts and journalists directory from the VeriFact design"
    />
  )
}

export function JournalistCreatePage() {
  return <VeriFactJournalistDashboardPage />
}

export function JournalistStatusPage(_props: { journalistId?: string }) {
  void _props
  return <VeriFactProfilePage />
}
