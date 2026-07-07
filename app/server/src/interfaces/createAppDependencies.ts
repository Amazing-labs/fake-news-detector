import { ActorManagementService } from '../application/services/ActorManagementService'
import { FactCheckingQueryService } from '../application/services/FactCheckingQueryService'
import { NotificationService } from '../application/services/NotificationService'
import { SecurityService } from '../application/services/SecurityService'
import { StorageMaintenanceService } from '../application/services/StorageMaintenanceService'
import { createTransactionalFactCheckingService } from '../application/services/createTransactionalFactCheckingService'
import { PrismaAuthoritySourceRepository } from '../infrastructure/repositories/persistence/PrismaAuthoritySourceRepository'
import { PrismaCitizenRepository } from '../infrastructure/repositories/persistence/PrismaCitizenRepository'
import { PrismaCorrectionRepository } from '../infrastructure/repositories/persistence/PrismaCorrectionRepository'
import { PrismaDirectorRepository } from '../infrastructure/repositories/persistence/PrismaDirectorRepository'
import { PrismaEvidenceRepository } from '../infrastructure/repositories/persistence/PrismaEvidenceRepository'
import { PrismaInboxSubjectMediaRepository } from '../infrastructure/repositories/persistence/PrismaInboxSubjectMediaRepository'
import { PrismaInboxSubjectRepository } from '../infrastructure/repositories/persistence/PrismaInboxSubjectRepository'
import { PrismaInvestigationMediaRepository } from '../infrastructure/repositories/persistence/PrismaInvestigationMediaRepository'
import { PrismaInvestigationRepository } from '../infrastructure/repositories/persistence/PrismaInvestigationRepository'
import { PrismaJournalistRepository } from '../infrastructure/repositories/persistence/PrismaJournalistRepository'
import { PrismaNotificationRepository } from '../infrastructure/repositories/persistence/PrismaNotificationRepository'
import { PrismaPublicationRepository } from '../infrastructure/repositories/persistence/PrismaPublicationRepository'
import { PrismaReferencedMediaRepository } from '../infrastructure/repositories/persistence/PrismaReferencedMediaRepository'
import { PrismaReportMediaRepository } from '../infrastructure/repositories/persistence/PrismaReportMediaRepository'
import { PrismaReportRepository } from '../infrastructure/repositories/persistence/PrismaReportRepository'
import { PrismaWatcherApplicationRepository } from '../infrastructure/repositories/persistence/PrismaWatcherApplicationRepository'
import { PrismaWorkflowAuditRepository } from '../infrastructure/repositories/persistence/PrismaWorkflowAuditRepository'
import { SupabaseStorageAdapter } from '../infrastructure/adapters'
import { BetterAuthRequestAuthenticator } from './auth/BetterAuthRequestAuthenticator'
import { DashboardController } from './controllers/DashboardController'
import { DirectorController } from './controllers/DirectorController'
import { InboxSubjectController } from './controllers/InboxSubjectController'
import { InvestigationController } from './controllers/InvestigationController'
import { JournalistManagementController } from './controllers/JournalistManagementController'
import { MediaController } from './controllers/MediaController'
import { MeController } from './controllers/MeController'
import { NotificationController } from './controllers/NotificationController'
import { PublicationController } from './controllers/PublicationController'
import { ReportController } from './controllers/ReportController'
import { WatcherApplicationController } from './controllers/WatcherApplicationController'
import { readProcessEnv } from '../shared'

export interface AppDependencies {
  securityService: SecurityService
  reportController: ReportController
  inboxSubjectController: InboxSubjectController
  investigationController: InvestigationController
  publicationController: PublicationController
  watcherApplicationController: WatcherApplicationController
  journalistManagementController: JournalistManagementController
  directorController: DirectorController
  notificationController: NotificationController
  meController: MeController
  dashboardController: DashboardController
  mediaController: MediaController
  storageMaintenanceService: StorageMaintenanceService
}

export function createAppDependencies(): AppDependencies {
  const reportRepository = new PrismaReportRepository()
  const reportMediaRepository = new PrismaReportMediaRepository()
  const investigationRepository = new PrismaInvestigationRepository()
  const investigationMediaRepository = new PrismaInvestigationMediaRepository()
  const publicationRepository = new PrismaPublicationRepository()
  const correctionRepository = new PrismaCorrectionRepository()
  const notificationRepository = new PrismaNotificationRepository()
  const workflowAuditRepository = new PrismaWorkflowAuditRepository()
  const citizenRepository = new PrismaCitizenRepository()
  const journalistRepository = new PrismaJournalistRepository()
  const directorRepository = new PrismaDirectorRepository()
  const watcherApplicationRepository = new PrismaWatcherApplicationRepository()
  const evidenceRepository = new PrismaEvidenceRepository()
  const inboxSubjectRepository = new PrismaInboxSubjectRepository()
  const inboxSubjectMediaRepository = new PrismaInboxSubjectMediaRepository()
  const authoritySourceRepository = new PrismaAuthoritySourceRepository()
  const referencedMediaRepository = new PrismaReferencedMediaRepository()
  const mediaStorage = new SupabaseStorageAdapter()

  const factCheckingService = createTransactionalFactCheckingService({
    reportRepository,
    reportMediaRepository,
    investigationRepository,
    investigationMediaRepository,
    publicationRepository,
    correctionRepository,
    notificationRepository,
    workflowAuditRepository,
    citizenRepository,
    journalistRepository,
    directorRepository,
    watcherApplicationRepository,
    evidenceRepository,
    inboxSubjectRepository,
    inboxSubjectMediaRepository,
    authoritySourceRepository,
    mediaStorage,
  })

  const actorManagementService = new ActorManagementService(
    directorRepository,
    journalistRepository,
    citizenRepository,
  )
  const queryService = new FactCheckingQueryService(
    reportRepository,
    inboxSubjectRepository,
    investigationRepository,
    investigationMediaRepository,
    evidenceRepository,
    publicationRepository,
    correctionRepository,
    watcherApplicationRepository,
    citizenRepository,
    journalistRepository,
    directorRepository,
    notificationRepository,
    inboxSubjectMediaRepository,
    reportMediaRepository,
    authoritySourceRepository,
    workflowAuditRepository,
  )
  const notificationService = new NotificationService(notificationRepository)
  const securityService = new SecurityService(
    new BetterAuthRequestAuthenticator(),
  )
  const storageMaintenanceService = new StorageMaintenanceService(
    mediaStorage,
    referencedMediaRepository,
    // Armed only when explicitly enabled; otherwise the sweep is dry-run so it
    // can be observed against the real bucket before deleting anything.
    readProcessEnv('STORAGE_SWEEP_ENABLED') === 'true',
  )

  return {
    securityService,
    mediaController: new MediaController(
      mediaStorage,
      referencedMediaRepository,
      storageMaintenanceService,
    ),
    storageMaintenanceService,
    reportController: new ReportController(factCheckingService, queryService),
    inboxSubjectController: new InboxSubjectController(
      factCheckingService,
      queryService,
    ),
    investigationController: new InvestigationController(
      factCheckingService,
      queryService,
    ),
    publicationController: new PublicationController(
      factCheckingService,
      queryService,
    ),
    watcherApplicationController: new WatcherApplicationController(
      factCheckingService,
      queryService,
    ),
    journalistManagementController: new JournalistManagementController(
      actorManagementService,
    ),
    directorController: new DirectorController(
      queryService,
      actorManagementService,
    ),
    notificationController: new NotificationController(notificationService),
    meController: new MeController(queryService),
    dashboardController: new DashboardController(queryService),
  }
}
