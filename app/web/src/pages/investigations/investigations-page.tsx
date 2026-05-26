import {
  InvestigationDetailWorkspacePage,
  InvestigationsWorkspacePage,
} from '../verifact-design/verifact-design-page'

export function InvestigationsPage() {
  return <InvestigationsWorkspacePage />
}

export function PublishedInvestigationsPage() {
  return <InvestigationsWorkspacePage defaultTab="published" />
}

export function InvestigationDetailPage(props: { investigationId: string }) {
  return (
    <InvestigationDetailWorkspacePage investigationId={props.investigationId} />
  )
}
