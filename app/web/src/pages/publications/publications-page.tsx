import {
  PublicationCorrectionsWorkspacePage,
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
