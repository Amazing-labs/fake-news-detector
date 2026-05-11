// domain/index.ts
// Entities (exports MediaCategory and Verdict)
export * from './entities'

// Value Objects (exclude MediaCategory and Verdict to avoid conflicts)
export type { MediaType, MediaOrigin } from './value-objects'
export {
  ReportMedia,
  InvestigationMedia,
  EvidenceMedia,
  InboxSubjectMedia,
  VerifiedMedia,
  VerifiedLink,
} from './value-objects'

// Repositories
export * from './repositories'

// Factories
export * from './factories'

// Domain events
export * from './events'

// Processes (workflow + audit composition)
export * from './processes/investigationStatusWorkflow'
