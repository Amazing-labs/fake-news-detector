import { WorkflowAudit } from '../entities/WorkflowAudit'

export interface IWorkflowAuditRepository {
  save(audit: WorkflowAudit): Promise<void>
  findById(id: string): Promise<WorkflowAudit | null>
  findByInvestigationId(investigationId: string): Promise<WorkflowAudit[]>
  findByActorId(actorId: string): Promise<WorkflowAudit[]>
  findRecent(limit: number): Promise<WorkflowAudit[]>
}
