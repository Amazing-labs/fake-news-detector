// shared/constants.ts

// Domain constants - business rules that are shared across entities
export const MAX_REVISION_ATTEMPTS = 1000
export const MAX_CORRECTION_ATTEMPTS = 1000
export const MAX_REPORTING_PER_CITIZEN_AT_A_TIME = 3
export const MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME = 1

// How many per-citizen notifications to persist per insert when broadcasting a
// publication/correction to the whole citizen base. Keeps a single saveMany
// from growing unbounded as the citizen count scales.
export const CITIZEN_NOTIFICATION_BATCH_SIZE = 500
