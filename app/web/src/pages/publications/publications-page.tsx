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
  return (
    <PublicationCorrectionsWorkspacePage publicationId={_props.publicationId} />
  )
}

export function PublicationDetailPage(props: { publicationId: string }) {
  return <PublicationDetailWorkspacePage publicationId={props.publicationId} />
}
