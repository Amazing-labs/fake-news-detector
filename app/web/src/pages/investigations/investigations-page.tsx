import {
  VeriFactGenericPage,
  VeriFactPendingPage,
} from '../verifact-design/verifact-design-page'

export function InvestigationsPage() {
  return <VeriFactPendingPage />
}

export function PublishedInvestigationsPage() {
  return (
    <VeriFactGenericPage
      title="Verified"
      description="Static published investigations list from the absorbed frontend design"
      kind="claims"
    />
  )
}

export function InvestigationDetailPage(_props: { investigationId: string }) {
  void _props
  return (
    <VeriFactGenericPage
      title="Claim Detail"
      description="Static investigation detail preview from the VeriFact design"
      kind="claims"
    />
  )
}
