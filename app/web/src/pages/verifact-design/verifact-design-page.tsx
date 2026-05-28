import { VeriFactAuthPage } from './auth-dashboard'
import {
  CitizenDashboardPage,
  CitizenReportCreateWorkspacePage,
  CitizenWorkspacePage,
  DirectorHomePage,
  GuestHomePage,
  InboxCreateWorkspacePage,
  InboxWorkspacePage,
  InvestigationDetailWorkspacePage,
  InvestigationsWorkspacePage,
  JournalistWorkspacePage,
  NotificationsWorkspacePage,
  PeopleManagementPage,
  PublicationCorrectionsWorkspacePage,
  PublicationDetailWorkspacePage,
  PublicationsWorkspacePage,
  ReportsWorkspacePage,
  RoleAwareDashboardPage,
  UserCreateWorkspacePage,
  UserStatusWorkspacePage,
  WatcherApplicationsReviewPage,
  WatcherWorkspacePage,
} from './domain-workspaces'
import { NotFoundPage } from './not-found-page'
import { ProfileDashboard } from './profile-dashboard'

export {
  CitizenDashboardPage,
  CitizenReportCreateWorkspacePage,
  CitizenWorkspacePage,
  DirectorHomePage,
  GuestHomePage,
  InboxCreateWorkspacePage,
  InboxWorkspacePage,
  InvestigationDetailWorkspacePage,
  InvestigationsWorkspacePage,
  JournalistWorkspacePage,
  NotFoundPage,
  NotificationsWorkspacePage,
  PeopleManagementPage,
  PublicationCorrectionsWorkspacePage,
  PublicationDetailWorkspacePage,
  PublicationsWorkspacePage,
  ReportsWorkspacePage,
  UserCreateWorkspacePage,
  UserStatusWorkspacePage,
  VeriFactAuthPage,
  WatcherApplicationsReviewPage,
  WatcherWorkspacePage,
}

export function VeriFactDashboardPage() {
  return <RoleAwareDashboardPage />
}

export function VeriFactCitizenDashboardPage() {
  return <CitizenDashboardPage />
}

export function VeriFactWatcherDashboardPage() {
  return <WatcherWorkspacePage />
}

export function VeriFactJournalistDashboardPage() {
  return <JournalistWorkspacePage />
}

export function VeriFactDirectorDashboardPage() {
  return <DirectorHomePage />
}

export function VeriFactClaimsPage() {
  return <InboxWorkspacePage />
}

export function VeriFactPendingPage() {
  return <InvestigationsWorkspacePage />
}

export function VeriFactNotificationsPage() {
  return <NotificationsWorkspacePage />
}

export function VeriFactProfilePage() {
  return <ProfileDashboard />
}

export function CorrectionsPage() {
  return <PublicationCorrectionsWorkspacePage />
}

export function VeriFactGenericPage() {
  return <RoleAwareDashboardPage />
}
