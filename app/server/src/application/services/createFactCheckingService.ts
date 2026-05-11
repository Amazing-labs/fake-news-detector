import {
  NoopDomainEventPublisher,
  type IDomainEventPublisher,
} from '../../domain/events'
import type {
  IAuthoritySourceRepository,
  ICitizenRepository,
  ICorrectionRepository,
  IDirectorRepository,
  IEvidenceRepository,
  IInboxSubjectMediaRepository,
  IInboxSubjectRepository,
  IInvestigationMediaRepository,
  IInvestigationRepository,
  IJournalistRepository,
  INotificationRepository,
  IPublicationRepository,
  IReportMediaRepository,
  IReportRepository,
  IWatcherApplicationRepository,
  IWorkflowAuditRepository,
} from '../../domain/repositories'
import {
  FactCheckingService,
  type FactCheckingServiceTransactionRunner,
} from './FactCheckingService'
import {
  CitizenWorkflowService,
  CorrectionWorkflowService,
  DirectorWorkflowService,
  InvestigationLifecycleService,
  JournalistWorkflowService,
} from './fact-checking'

export interface FactCheckingServiceRepositoryDependencies {
  reportRepository: IReportRepository
  reportMediaRepository: IReportMediaRepository
  investigationRepository: IInvestigationRepository
  investigationMediaRepository: IInvestigationMediaRepository
  publicationRepository: IPublicationRepository
  correctionRepository: ICorrectionRepository
  notificationRepository: INotificationRepository
  workflowAuditRepository: IWorkflowAuditRepository
  citizenRepository: ICitizenRepository
  journalistRepository: IJournalistRepository
  directorRepository: IDirectorRepository
  watcherApplicationRepository: IWatcherApplicationRepository
  evidenceRepository: IEvidenceRepository
  inboxSubjectRepository: IInboxSubjectRepository
  inboxSubjectMediaRepository: IInboxSubjectMediaRepository
  authoritySourceRepository: IAuthoritySourceRepository
}

export function createFactCheckingService(
  dependencies: FactCheckingServiceRepositoryDependencies,
  domainEventPublisher: IDomainEventPublisher = new NoopDomainEventPublisher(),
  transactionRunner?: FactCheckingServiceTransactionRunner,
): FactCheckingService {
  const investigationLifecycleService = new InvestigationLifecycleService(
    dependencies.reportRepository,
    dependencies.inboxSubjectRepository,
    dependencies.citizenRepository,
    dependencies.journalistRepository,
    dependencies.evidenceRepository,
    dependencies.notificationRepository,
    domainEventPublisher,
  )

  const citizenWorkflowService = new CitizenWorkflowService(
    dependencies.citizenRepository,
    dependencies.reportRepository,
    dependencies.reportMediaRepository,
    dependencies.inboxSubjectRepository,
    dependencies.investigationRepository,
    dependencies.evidenceRepository,
    dependencies.notificationRepository,
    dependencies.watcherApplicationRepository,
  )

  const journalistWorkflowService = new JournalistWorkflowService(
    dependencies.journalistRepository,
    dependencies.investigationRepository,
    dependencies.investigationMediaRepository,
    dependencies.inboxSubjectRepository,
    dependencies.inboxSubjectMediaRepository,
    dependencies.reportMediaRepository,
    dependencies.evidenceRepository,
    dependencies.authoritySourceRepository,
    dependencies.workflowAuditRepository,
  )

  const directorWorkflowService = new DirectorWorkflowService(
    dependencies.directorRepository,
    dependencies.investigationRepository,
    dependencies.publicationRepository,
    dependencies.notificationRepository,
    dependencies.workflowAuditRepository,
    dependencies.watcherApplicationRepository,
    dependencies.citizenRepository,
    dependencies.inboxSubjectRepository,
    dependencies.inboxSubjectMediaRepository,
    dependencies.reportRepository,
    dependencies.authoritySourceRepository,
    domainEventPublisher,
    investigationLifecycleService,
  )

  const correctionWorkflowService = new CorrectionWorkflowService(
    dependencies.directorRepository,
    dependencies.publicationRepository,
    dependencies.correctionRepository,
    dependencies.notificationRepository,
    dependencies.citizenRepository,
    dependencies.investigationRepository,
  )

  return new FactCheckingService(
    citizenWorkflowService,
    journalistWorkflowService,
    directorWorkflowService,
    correctionWorkflowService,
    transactionRunner,
  )
}
