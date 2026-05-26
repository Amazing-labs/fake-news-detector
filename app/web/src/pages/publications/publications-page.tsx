import {
  PublicationCorrectionsWorkspacePage,
  PublicationDetailWorkspacePage,
  PublicationsWorkspacePage,
} from '../verifact-design/verifact-design-page'

export function PublicationsPage() {
  return <PublicationsWorkspacePage />
}

export function PublicationsListPage() {
  return <PublicationsWorkspacePage />
}

export function PublicationCorrectionsPage(_props: { publicationId?: string }) {
  void _props
  return <PublicationCorrectionsWorkspacePage />
}

export function PublicationDetailPage(props: { publicationId: string }) {
  return <PublicationDetailWorkspacePage publicationId={props.publicationId} />
}
