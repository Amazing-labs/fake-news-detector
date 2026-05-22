import {
  VeriFactClaimsPage,
  VeriFactGenericPage,
} from '../verifact-design/verifact-design-page'

export function InboxSubjectsPage() {
  return <VeriFactClaimsPage />
}

export function InboxSubjectsCreatePage() {
  return (
    <VeriFactGenericPage
      title="New Claim"
      description="Static creation workspace from the VeriFact design"
    />
  )
}

export function InboxSubjectsReportsPage() {
  return (
    <VeriFactGenericPage
      title="Reports"
      description="Static report qualification workspace from the VeriFact design"
      kind="claims"
    />
  )
}
