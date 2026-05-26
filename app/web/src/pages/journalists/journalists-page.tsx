import {
  PeopleManagementPage,
  UserCreateWorkspacePage,
  UserStatusWorkspacePage,
} from '../verifact-design/verifact-design-page'

export function JournalistsListPage() {
  return <PeopleManagementPage />
}

export function JournalistCreatePage() {
  return <UserCreateWorkspacePage />
}

export function JournalistStatusPage(props: { journalistId?: string }) {
  return <UserStatusWorkspacePage userLabel={props.journalistId} />
}
