/**
 * @module
 * Mirrors the investigation lifecycle rules the server enforces
 * (`domain/entities/Investigation.ts`) so a control is greyed out exactly when
 * the API would refuse the call, and says why. The server stays the authority:
 * this only keeps the interface honest about what is still possible.
 */
import type { InvestigationStatus, Verdict } from './schemas'

export type ActionState = { enabled: true } | { enabled: false; reason: string }

const ALLOWED: ActionState = { enabled: true }
const denied = (reason: string): ActionState => ({ enabled: false, reason })

// Terminal statuses: `Investigation.isTerminal()`. Nothing moves after these.
const CLOSED_STATUSES = [
  'PUBLISHED',
  'ARCHIVED',
  'CANCELED',
] as const satisfies readonly InvestigationStatus[]

type ClosedStatus = (typeof CLOSED_STATUSES)[number]

const CLOSED_REASON: Record<ClosedStatus, string> = {
  PUBLISHED: 'Dossier publié : le circuit éditorial est clos.',
  ARCHIVED: 'Dossier archivé : le circuit éditorial est clos.',
  CANCELED: 'Dossier annulé : le circuit éditorial est clos.',
}

// `Investigation.approve()` only accepts these; UNVERIFIABLE goes to archive.
const PUBLISHABLE_VERDICTS: readonly Verdict[] = ['TRUE', 'FALSE', 'MISLEADING']

export function isInvestigationClosed(
  status: InvestigationStatus,
): status is ClosedStatus {
  return (CLOSED_STATUSES as readonly InvestigationStatus[]).includes(status)
}

/**
 * Whether the journalist may still work the dossier — the single gate behind
 * saving a draft, classifying media and submitting for review, all of which
 * `Investigation.canBeEdited()` guards server-side.
 */
export function journalistDossierAccess(
  status: InvestigationStatus,
): ActionState {
  if (isInvestigationClosed(status)) return denied(CLOSED_REASON[status])
  if (status === 'PENDING_REVIEW') {
    return denied(
      'Dossier en revue direction : il est verrouillé jusqu’à l’arbitrage.',
    )
  }
  return ALLOWED
}

/**
 * Whether a watcher may still add evidence. Mirrors
 * `Investigation.canReceiveWatcherEvidence()`: a dossier only opens to outside
 * contribution once the director has sent it back for revision.
 */
export function watcherContributionAccess(
  status: InvestigationStatus,
): ActionState {
  return status === 'NEEDS_REVISION'
    ? ALLOWED
    : denied(
        'Ce dossier n’est pas ouvert à contribution : la direction ne l’a pas renvoyé en correction.',
      )
}

export interface ArbitrationActions {
  publish: ActionState
  archive: ActionState
  requestRevision: ActionState
  cancel: ActionState
}

/** The four editorial actions the director can take on a dossier. */
export function directorArbitrationActions(
  status: InvestigationStatus,
  verdict: Verdict,
): ArbitrationActions {
  if (isInvestigationClosed(status)) {
    const closed = denied(CLOSED_REASON[status])
    return {
      publish: closed,
      archive: closed,
      requestRevision: closed,
      cancel: closed,
    }
  }

  // Publish / archive / send-back all require the dossier to be under review.
  const notUnderReview =
    status === 'PENDING_REVIEW'
      ? null
      : denied('Le dossier doit être en revue direction pour être arbitré.')

  return {
    publish:
      notUnderReview ??
      (PUBLISHABLE_VERDICTS.includes(verdict)
        ? ALLOWED
        : denied(
            'Un verdict « non vérifiable » ne se publie pas : archivez le dossier.',
          )),
    archive:
      notUnderReview ??
      (verdict === 'UNVERIFIABLE'
        ? ALLOWED
        : denied(
            'L’archivage est réservé aux dossiers au verdict « non vérifiable ».',
          )),
    requestRevision: notUnderReview ?? ALLOWED,
    // `cancelManually()` is open from any non-terminal status.
    cancel: ALLOWED,
  }
}
