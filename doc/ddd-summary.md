# DDD Domain Summary - Fake News Detector

## Project Overview

**Fake News Detector** is a fact-checking platform that enables collaborative verification of news and information through a structured workflow involving Citizens, Journalists, and Editorial Directors.

---

## Architecture Overview

### Bounded Context

- **Core Domain**: Fact-checking workflow and content verification
- **Supporting Domains**: User management, notifications, watcher applications

### Layered Architecture

```
interfaces/      ← HTTP boundary: Hono routes, controllers, Zod schemas, auth middleware
application/     ← Use-case orchestration: FactCheckingService (facade) delegates to
                    CitizenWorkflowService, JournalistWorkflowService,
                    DirectorWorkflowService, CorrectionWorkflowService
domain/          ← Pure business logic: entities, value objects, repository interfaces,
                    domain processes, domain events (no infrastructure imports)
infrastructure/  ← Prisma repository implementations, DB config, EmailAdapter
shared/          ← Cross-cutting: constants, types, errors, env
```

---

## Domain Actors (Aggregates)

### 1. Citizen

Regular users who submit reports and can become Watchers.

**Key attributes:** `citizenType: REGULAR | WATCHER`, `openReportsCount`, `engagementScore`, `maxOpenReports (= 3)`

**Invariants:**

- `canSubmitReport()` → active AND `openReportsCount < 3`
- `canSubmitEvidence()` → active AND `citizenType === WATCHER`
- `canApplyForWatcher()` → active AND `citizenType === REGULAR`

**Behaviors:** `submitReport()`, `submitEvidence()` (+2 score), `applyForWatcher()`, `promoteToWatcher()`, `reportResolved()` (decrements count)

### 2. Journalist

Users who investigate reports and produce verifications.

**Key attributes:** `activeInvestigationsCount`, `maxActiveInvestigations (= 1)`, `engagementScore`

**Invariants:**

- `canAnalyze()` → active AND `activeInvestigationsCount < 1`
- `correctInvestigation()` → fails if `attemptCount >= MAX_CORRECTION_ATTEMPTS`

**Behaviors:** `pickInboxSubject()`, `submitForReview()`, `correctInvestigation()`, `onInvestigationFinalized()` (+2 score if not CANCELED)

### 3. Director

Editorial directors who validate and publish investigations.

**Key attributes:** `scoreInvestigation` (incremented on publish, create/archive inbox)

**Behaviors:** `publishInvestigation()`, `rejectInvestigation()`, `markAsArchived()`, `cancelInvestigation()`, `createInboxSubject()`, `approveWatcherApplication()`

---

## Core Domain Entities

### Report

A user-submitted claim to be verified.

**Attributes:** `citizenId`, `theme`, `title`, `content`, `status: ReportStatus`

**Lifecycle:** `OPEN → ARCHIVED` (simple, two-state only)

**Invariants:** `canBeArchived()` = status is `OPEN`

### Investigation

The fact-checking process linked to an InboxSubject.

**Attributes:** `inboxSubjectId`, `journalistId`, `mediaCategory: MediaCategory | null`, `draftVerdict: Verdict`, `investigationNotes`, `attemptCount`, `status: InvestigationStatus`

**Lifecycle:**

```
OPEN → IN_PROGRESS → PENDING_REVIEW → PUBLISHED
                                    → ARCHIVED      (UNVERIFIABLE verdict only)
                                    → NEEDS_REVISION → IN_PROGRESS (correction cycle)
                                    → CANCELED
```

**Invariants:**

- `canBeEdited()` → status in `{OPEN, IN_PROGRESS, NEEDS_REVISION}`
- `submitForReview()` → requires `mediaCategory` non-null
- `approve()` → requires `draftVerdict` in `{TRUE, FALSE, MISLEADING}` (not UNVERIFIABLE)
- `markAsArchived()` → requires `draftVerdict === UNVERIFIABLE`
- `requestRevision()` → if `attemptCount >= MAX_REVISION_ATTEMPTS`, sets CANCELED instead
- `cancelManually()` → throws if already terminal (PUBLISHED, ARCHIVED, CANCELED)

### Evidence

Supporting documentation submitted by Watchers.

**Attributes:** `investigationId`, `watcherId`, `title`, `content`, `media: EvidenceMedia[]`

**Invariants:** Submitter must be `citizenType === WATCHER`

### Publication

Final published result of an investigation.

**Attributes:** `investigationId`, `approvedById`, `finalVerdict: Verdict`, `publishedAt`, `isCorrection`, `verifiedLinks`, `verifiedMedia`

**Behaviors:** `markAsCorrection()`, `hasVerifiedEvidence()`

### WatcherApplication

Request for a citizen to become a WATCHER.

**Attributes:** `actorId`, `motivation`, `status: WatcherApplicationStatus`

**Lifecycle:** `PENDING → APPROVED | REJECTED`

### InboxSubject

Topics that feed into investigation assignments.

**Attributes:** `theme`, `description`, `createdById`, `reportId?`, `status: InboxSubjectStatus`, `origin: InboxSubjectOrigin`

**Lifecycle:** `OPEN → IN_PROGRESS → ARCHIVED`

**Origins:** `REPORT` (from citizen signalement) | `DIRECTOR_INITIATED` (created by director)

### Notification

System alerts for users.

**Attributes:** `type: NotificationType`, `theme`, `message`, `actorId`, `isRead`, `publicationId?`, `investigationId?`

**Invariants by type:**

- `PUBLICATION`, `CORRECTION` → require `publicationId`, no `investigationId`
- `ARCHIVED_PUBLICATION` → requires `investigationId`, no `publicationId`
- `ALERT` → neither required

---

## Domain Relationships

```
Citizen      1──* Report            (submits)
Report       1──0..1 InboxSubject   (becomes, origin=REPORT)
Director     1──* InboxSubject      (creates, origin=DIRECTOR_INITIATED)
InboxSubject 1──0..1 Investigation  (assigned to journalist)
Journalist   1──* Investigation     (conducts)
Citizen      1──* Evidence          (submits, WATCHER only)
Investigation 1──* Evidence         (contains)
Investigation 1──0..1 Publication   (produces)
Publication  1──* Notification      (generates, broadcast or targeted)
Citizen      1──0..1 WatcherApplication (applies for)
```

---

## Domain Processes

### `investigationStatusWorkflow`

Orchestrates state transitions with audit trail:

| Function                                     | Actor      | Action                                                     |
| -------------------------------------------- | ---------- | ---------------------------------------------------------- |
| `submitInvestigationForReviewWithAudit`      | Journalist | Validates readiness, transitions to PENDING_REVIEW         |
| `directorApproveInvestigationWithAudit`      | Director   | Calls `investigation.approve()` → PUBLISHED                |
| `directorRejectInvestigationWithAudit`       | Director   | Calls `rejectInvestigation()` → NEEDS_REVISION or CANCELED |
| `directorAcceptUnverifiableArchiveWithAudit` | Director   | Calls `markAsArchived()` → ARCHIVED                        |
| `directorCancelInvestigationWithAudit`       | Director   | Calls `cancelManually()` → CANCELED                        |

### `investigationReviewReadiness`

Pre-submission validation:

- **Source media** (CITIZEN_REPORT or DIRECTOR_INITIATED origin): must have `category`, `reliability`, non-empty `justification`; triggers `investigation.mediaCategory` requirement
- **Journalist proof** (JOURNALIST_PROOF origin): must have `authoritySourceId`; must NOT have `category`, `reliability`, `justification`
- **Watcher evidence**: each bundle must have ≥1 media; each media must have `category`, `reliability`, non-empty `justification`

### `investigationMediaCopy`

On journalist pickup, copies source media (from Report or DirectorInboxSubject) into InvestigationMedia, preserving `order`, tagging origin.

---

## Critical Business Rules (Invariants)

1. **Citizen Report Limit**: Max 3 open reports per citizen (`MAX_REPORTING_PER_CITIZEN_AT_A_TIME = 3`)
2. **Journalist Investigation Limit**: Max 1 active investigation per journalist (`MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME = 1`)
3. **Evidence Submission**: Only `WATCHER` citizens can submit evidence
4. **Watcher Promotion**: Requires Director approval via WatcherApplication
5. **Investigation Publication**: Director only; verdict must be in `{TRUE, FALSE, MISLEADING}`
6. **UNVERIFIABLE Archive Rule**: UNVERIFIABLE verdict → ARCHIVED (never PUBLISHED)
7. **Correction Chain**: Publications can be marked `isCorrection = true`
8. **Media Classification**: Citizen/Director media require journalist classification before review submission; Journalist proof media must NOT be classified

---

## Enums

### Actor

| Enum            | Values                                                          |
| --------------- | --------------------------------------------------------------- |
| `Role`          | `EDITORIAL_DIRECTOR`, `JOURNALIST`, `CITIZEN`                   |
| `AccountStatus` | `ACTIVE`, `DISABLED`, `BANNED`                                  |
| `StatusReason`  | `SPAM`, `ABUSE`, `FRAUD`, `INACTIVITY`, `USER_REQUEST`, `OTHER` |
| `CitizenType`   | `REGULAR`, `WATCHER`                                            |

### Content Lifecycle

| Enum                       | Values                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `ReportStatus`             | `OPEN`, `ARCHIVED`                                                                             |
| `InvestigationStatus`      | `OPEN`, `IN_PROGRESS`, `PENDING_REVIEW`, `NEEDS_REVISION`, `PUBLISHED`, `ARCHIVED`, `CANCELED` |
| `WatcherApplicationStatus` | `PENDING`, `APPROVED`, `REJECTED`                                                              |
| `InboxSubjectStatus`       | `OPEN`, `IN_PROGRESS`, `ARCHIVED`                                                              |
| `InboxSubjectOrigin`       | `REPORT`, `DIRECTOR_INITIATED`                                                                 |

### Verdicts & Media

| Enum               | Values                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `Verdict`          | `TRUE`, `FALSE`, `MISLEADING`, `UNVERIFIABLE`                                                          |
| `MediaCategory`    | `CONTEXT_COLLAPSE`, `MANIPULATED`, `FABRICATED`, `SATIRE`, `MISLEADING`, `IMPOSTOR`, `OTHER`           |
| `MediaType`        | `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`, `LINK`, `TEXT`                                                  |
| `MediaOrigin`      | `CITIZEN_REPORT`, `JOURNALIST_PROOF`, `DIRECTOR_INITIATED`                                             |
| `SourceType`       | `OFFICIAL_DECREE`, `ORIGINAL_RETRACTION`, `DIRECT_EVIDENCE`, `MEDIA_CROSSCHECK`, `AUTHORITY_STATEMENT` |
| `NotificationType` | `PUBLICATION`, `CORRECTION`, `ALERT`, `ARCHIVED_PUBLICATION`                                           |

---

## Role-Based Permissions Matrix

### Report & Evidence Management

| Permission            | Citizen | Journalist | Director | Notes                     |
| :-------------------- | :-----: | :--------: | :------: | :------------------------ |
| Submit Report         |   ✅    |     ❌     |    ❌    | Max 3 open; ACTIVE only   |
| Submit Evidence       |   ✅    |     ❌     |    ❌    | WATCHER type required     |
| Pick InboxSubject     |   ❌    |     ✅     |    ❌    | Subject must be OPEN      |
| Classify Source Media |   ❌    |     ✅     |    ❌    | Before review submission  |
| Add Proof Media       |   ❌    |     ✅     |    ❌    | Requires authority source |
| Submit for Review     |   ❌    |     ✅     |    ❌    | mediaCategory required    |
| Correct Investigation |   ❌    |     ✅     |    ❌    | After NEEDS_REVISION      |

### Validation & Publishing

| Permission            | Citizen | Journalist | Director | Notes                         |
| :-------------------- | :-----: | :--------: | :------: | :---------------------------- |
| Approve Investigation |   ❌    |     ❌     |    ✅    | Verdict TRUE/FALSE/MISLEADING |
| Archive Unverifiable  |   ❌    |     ❌     |    ✅    | Verdict UNVERIFIABLE only     |
| Reject for Revision   |   ❌    |     ❌     |    ✅    | → NEEDS_REVISION or CANCELED  |
| Cancel Investigation  |   ❌    |     ❌     |    ✅    | Any non-terminal status       |
| Publish Correction    |   ❌    |     ❌     |    ✅    | From existing publication     |

### User & Watcher Management

| Permission                 | Citizen | Journalist | Director | Notes                   |
| :------------------------- | :-----: | :--------: | :------: | :---------------------- |
| Apply for Watcher          |   ✅    |     ❌     |    ❌    | Must be REGULAR citizen |
| Approve/Reject Watcher App |   ❌    |     ❌     |    ✅    | Review motivation       |
| Ban/Disable/Activate Users |   ❌    |     ❌     |    ✅    | All actor types         |
| Create/Delete InboxSubject |   ❌    |     ❌     |    ✅    | DIRECTOR_INITIATED only |

---

## Anti-Patterns to Detect

1. **Anemic Domain Model**: Entities with only getters/setters, no business logic
2. **God Services**: Application services with too many responsibilities
3. **Repository Leakage**: Domain logic in repositories
4. **Missing Invariants**: Business rules not enforced in domain layer
5. **Wrong Layer Access**: Infrastructure directly accessed from domain
6. **Bypassing Process Functions**: Calling entity methods directly instead of workflow orchestrators in `investigationStatusWorkflow`
