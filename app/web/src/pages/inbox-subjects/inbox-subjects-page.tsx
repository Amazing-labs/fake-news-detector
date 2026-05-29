import {
  InboxCreateWorkspacePage,
  InboxSubjectDetailWorkspacePage,
  InboxWorkspacePage,
  ReportsWorkspacePage,
} from '../verifact-design/verifact-design-page'

export function InboxSubjectsPage() {
  return <InboxWorkspacePage />
}

export function InboxSubjectsCreatePage() {
  return <InboxCreateWorkspacePage />
}

export function InboxSubjectsReportsPage() {
  return <ReportsWorkspacePage />
}

export function InboxSubjectDetailPage({ subjectId }: { subjectId: string }) {
  return <InboxSubjectDetailWorkspacePage subjectId={subjectId} />
}
