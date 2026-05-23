import {
  Archive,
  BarChart3,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileSearch,
  Inbox,
  Users,
} from 'lucide-react'
import { AppLayout } from './app-layout'
import { ActorTabsPage } from './actor-tabs-page'
import { VeriFactAuthPage } from './auth-dashboard'
import { CorrectionsPage } from './corrections-page'
import { MetricGrid } from './metric-grid'
import { NotFoundPage } from './not-found-page'
import { NotificationsDashboard } from './notifications-dashboard'
import { ProfileDashboard } from './profile-dashboard'
import { RoleDashboard } from './role-dashboard'
import { WorkTable } from './work-table'

export { CorrectionsPage, NotFoundPage, VeriFactAuthPage }

export function VeriFactDashboardPage() {
  return <RoleDashboard actor="guest" />
}

export function VeriFactCitizenDashboardPage() {
  return <RoleDashboard actor="citizen" />
}

export function VeriFactWatcherDashboardPage() {
  return <RoleDashboard actor="watcher" />
}

export function VeriFactJournalistDashboardPage() {
  return <RoleDashboard actor="journalist" />
}

export function VeriFactDirectorDashboardPage() {
  return <RoleDashboard actor="director" />
}

export function VeriFactClaimsPage() {
  return (
    <ActorTabsPage
      actor="watcher"
      title="Sujets."
      description="Qualification par filtre: global, creations internes et signalements citoyens."
      tabs={[
        { value: 'global', label: 'Global', icon: Inbox },
        { value: 'create', label: 'Creation', icon: FilePlus2 },
        { value: 'reports', label: 'Signalements', icon: FileSearch },
      ]}
    />
  )
}

export function VeriFactPendingPage() {
  return (
    <ActorTabsPage
      actor="director"
      title="Enquetes."
      description="Une seule page avec filtre entre dossiers en attente, publies et annules."
      tabs={[
        { value: 'pending', label: 'En attente', icon: Clock3 },
        { value: 'published', label: 'Publiees', icon: CheckCircle2 },
        { value: 'canceled', label: 'Annulees', icon: Archive },
      ]}
    />
  )
}

export function VeriFactNotificationsPage() {
  return <NotificationsDashboard />
}

export function VeriFactProfilePage() {
  return <ProfileDashboard />
}

export function VeriFactGenericPage(props: {
  title: string
  description: string
  kind?: 'dashboard' | 'claims' | 'pending' | 'analytics' | 'profile'
}) {
  if (props.kind === 'claims') return <VeriFactClaimsPage />
  if (props.kind === 'pending') return <VeriFactPendingPage />
  if (props.kind === 'profile') return <VeriFactProfilePage />
  if (props.kind === 'analytics') {
    return (
      <ActorTabsPage
        actor="admin"
        title={props.title}
        description={props.description}
        tabs={[
          { value: 'overview', label: 'Vue globale', icon: BarChart3 },
          { value: 'users', label: 'Utilisateurs', icon: Users },
        ]}
      />
    )
  }

  return (
    <AppLayout actor="journalist" page="dashboard">
      <MetricGrid actor="journalist" />
      <WorkTable title={props.title} description={props.description} />
    </AppLayout>
  )
}
