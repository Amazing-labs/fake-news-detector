# Fake News Detector

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-black.svg)](https://bun.sh/)
[![Prisma](https://img.shields.io/badge/Prisma-7.6-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

> A collaborative fact-checking platform that empowers citizens and journalists to combat misinformation through a structured, transparent verification process.

## Overview

Fake News Detector is a **Domain-Driven Design (DDD)** based platform that facilitates collaborative fact-checking. The system connects three distinct user roles in a structured workflow to verify information accuracy and publish transparent analysis results.

### Business Vision

In an era of information overload, distinguishing fact from fiction is critical. This platform creates an ecosystem where:

- **Citizens** contribute by reporting suspicious content and providing evidence
- **Journalists** conduct thorough investigations using professional methodology
- **Directors** ensure quality control and editorial standards

## Key Features

### Multi-Role Collaboration

- **Citizen (REGULAR)** - Submit reports (max 3 open), track status, view notifications, apply for Watcher status
- **Citizen (WATCHER)** - Privileged citizens who can submit evidence to ongoing investigations (+2 engagement points)
- **Journalist** - Pick reports, conduct investigations (max 1 active), submit for review
- **Director (EDITORIAL_DIRECTOR)** - Validate investigations, publish/archive results, manage users, approve Watcher applications

### Structured Fact-Checking Workflow

```
Report ──▶ InboxSubject ──▶ Investigation ──▶ Review ──▶ Publication
              (mandatory)        (origin-tagged media)
```

1. **Submission** - Citizens submit suspicious content with media (Report status: OPEN)
2. **Inbox Creation** - All reports become InboxSubjects (origin: REPORT or DIRECTOR_INITIATED)
3. **Assignment** - Journalists pick InboxSubjects and start investigations
4. **Evidence Collection** - Watchers contribute supporting evidence
5. **Validation** - Directors review and approve investigations
6. **Publication** - Verified analysis is published with final verdict

### Quality Control Mechanisms

- **Citizen Report Limit** - Maximum 3 open reports per citizen (`MAX_REPORTING_PER_CITIZEN_AT_A_TIME = 3`)
- **Journalist Investigation Limit** - Maximum 1 active investigation per journalist (`MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME = 1`)
- **Evidence Submission Restriction** - Only citizens with `WATCHER` type can submit evidence
- **Watcher Promotion System** - Citizens apply via `WatcherApplication`; Director approves/rejects
- **Revision Attempt Limits** - Maximum attempts for correction cycles (`MAX_REVISION_ATTEMPTS`, `MAX_CORRECTION_ATTEMPTS`)
- **Media Origin Tracking** - All media tracked by origin: `CITIZEN_REPORT`, `DIRECTOR_INITIATED`, `JOURNALIST_PROOF`
- **Source Media Classification** - Citizen/Director media require category, reliability, justification by journalist
- **Journalist Proof Requirements** - Journalist-added media require authority source, no classification fields
- **Watcher Evidence Media** - Watcher contributions require at least one media with complete classification
- **Engagement Scoring** - Points awarded for participation (submit report: +1, submit evidence: +2, publication: +2)
- **Account Status Management** - ACTIVE, DISABLED, BANNED states with reasons (SPAM, ABUSE, FRAUD, INACTIVITY, USER_REQUEST, OTHER)

## Architecture

### Domain-Driven Design (DDD)

The application follows DDD principles with clear bounded contexts:

```
app/server/src/
├── domain/              # Pure business logic (no infrastructure imports)
│   ├── entities/        # Core domain objects (Citizen, Journalist, Director, etc.)
│   ├── value-objects/   # Immutable value types (Media, VerifiedMedia, EvidenceMedia)
│   ├── factories/       # Entity factories
│   ├── repositories/    # Repository interfaces (I*Repository.ts)
│   ├── processes/       # Workflow orchestration (investigationStatusWorkflow,
│   │                    #   investigationReviewReadiness, investigationMediaCopy)
│   └── events/          # Domain events
├── application/         # Use-case orchestration
│   └── services/        # FactCheckingService (facade) + sub-workflow services
├── infrastructure/      # Technical implementations
│   ├── config/          # Database, Prisma (modular schema via prismaSchemaFolder)
│   └── repositories/    # Prisma*Repository implementations
├── interfaces/          # HTTP boundary
│   ├── routes/          # Hono route definitions
│   ├── controllers/     # Request handlers
│   ├── http/schemas/    # Zod OpenAPI schemas
│   ├── auth/            # better-auth integration + actor linking
│   └── middlewares/     # Auth middleware
└── shared/              # Constants, types, errors, env
```

### Core Entities

| Entity               | Responsibility                                                           | Key Invariants                                                                                                  |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `Citizen`            | Report submission, watcher application, evidence submission (if WATCHER) | Max 3 open reports; Only WATCHER can submit evidence                                                            |
| `Journalist`         | Investigation management, draft creation, submission for review          | Max 1 active investigation at a time                                                                            |
| `Director`           | Validation, user management, inbox subject creation, watcher approval    | Cannot validate own work; Editorial oversight                                                                   |
| `Report`             | User-submitted suspicious content with theme, title, content             | Simple lifecycle: OPEN → ARCHIVED only                                                                          |
| `Investigation`      | Journalist's fact-checking process with verdict and media category       | Max revision attempts; Requires media category before submission                                                |
| `Evidence`           | Supporting documents submitted by Watchers                               | Linked to investigation; Submitter must be WATCHER                                                              |
| `Publication`        | Final approved analysis with verdict                                     | Can be marked as correction                                                                                     |
| `WatcherApplication` | Request for citizen to become WATCHER                                    | Status: PENDING → APPROVED/REJECTED                                                                             |
| `Notification`       | System alerts for users                                                  | Types: PUBLICATION, CORRECTION, ALERT, ARCHIVED_PUBLICATION. Targeted notifications for archived investigations |
| `InboxSubject`       | Topics created by Directors for organization                             | Managed by Directors only; Origin: REPORT or DIRECTOR_INITIATED                                                 |

### Investigation Lifecycle

```
OPEN → IN_PROGRESS → PENDING_REVIEW → PUBLISHED
                                    → ARCHIVED      (UNVERIFIABLE verdict only)
                                    → NEEDS_REVISION → IN_PROGRESS (correction cycle)
                                    → CANCELED
```

**Status Definitions:**

- **OPEN** - Initial state when journalist picks an InboxSubject
- **IN_PROGRESS** - Journalist working on draft (can edit media category, verdict, notes)
- **PENDING_REVIEW** - Submitted to Director for validation
- **NEEDS_REVISION** - Director rejected; sent back for corrections (limited attempts before CANCELED)
- **PUBLISHED** - Director approved with TRUE/FALSE/MISLEADING verdict
- **ARCHIVED** - UNVERIFIABLE verdict accepted by Director (cannot be published)
- **CANCELED** - Manually canceled by Director, or max correction attempts exceeded

**Source of Truth Principle:**

- **Report**: Tracks citizen submission only (`OPEN → ARCHIVED`)
- **InboxSubject**: Tracks investigation progress (`OPEN → IN_PROGRESS → ARCHIVED`)
- **Investigation**: Tracks fact-checking workflow

**Transitions:**

- Journalist: `OPEN` → `IN_PROGRESS` (automatically on pick)
- Journalist: `IN_PROGRESS` → `PENDING_REVIEW` (via `submitForReview()`)
- Director: `PENDING_REVIEW` → `PUBLISHED` (if verdict is TRUE/FALSE/MISLEADING)
- Director: `PENDING_REVIEW` → `ARCHIVED` (if verdict is UNVERIFIABLE)
- Director: `PENDING_REVIEW` → `NEEDS_REVISION` (rejection with feedback; → CANCELED if max attempts reached)
- Journalist: `NEEDS_REVISION` → `IN_PROGRESS` (correction cycle)
- Director: any non-terminal → `CANCELED` (manual cancel)

### Domain Values

**Media Categories** (Classification of suspicious content):

- `CONTEXT_COLLAPSE` - Missing or altered context
- `MANIPULATED` - Edited or doctored content
- `FABRICATED` - Completely false/original creation
- `SATIRE` - Parody or satirical content presented as fact
- `MISLEADING` - Partially true but misleading presentation
- `IMPOSTOR` - Impersonation or false attribution
- `OTHER` - Does not fit other categories

**Verdicts** (Final determination):

- `TRUE` - Content is accurate
- `FALSE` - Content is completely false
- `MISLEADING` - Content is partially true but misleading
- `UNVERIFIABLE` - Cannot be verified (leads to ARCHIVED status)

**Standard Publication Verdicts**: `TRUE`, `FALSE`, `MISLEADING` (can be published)
**Archive-only Verdict**: `UNVERIFIABLE` (must be archived, not published)

**Notification Types**:

- `PUBLICATION` - New publication available (broadcast to all citizens)
- `CORRECTION` - Published content corrected
- `ALERT` - System or administrative alert
- `ARCHIVED_PUBLICATION` - Investigation archived with UNVERIFIABLE verdict (targeted: journalist + citizen + watchers only)

**Notification Behavior**:

- **Publications** (TRUE/FALSE/MISLEADING verdicts): Broadcast to all citizens + journalist notification
- **Archived Publications** (UNVERIFIABLE verdicts): Targeted notifications only to stakeholders (journalist who investigated, citizen who reported, watchers who contributed evidence)

## Technology Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev/) - Lightweight web framework
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Language**: TypeScript with strict type checking
- **Architecture**: Domain-Driven Design (DDD)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.3.6 or higher
- PostgreSQL 15 or higher
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/The-man-dies/fake-news-detector.git
cd fake-news-detector
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

```bash
cp app/server/.env.example app/server/.env
# Edit app/server/.env with your database credentials and auth secrets
```

4. Run database migrations:

```bash
cd app/server
bun run generate   # Generate Prisma Client
bun run migrate    # Run migrations (dev)
```

5. Seed an initial director account:

```bash
cd app/server
bun run create:director
```

6. Start all dev servers from the repo root:

```bash
bun run dev
```

### Available Scripts

**Root (monorepo):**

```bash
bun run dev              # Start all workspaces in parallel
bun run build            # Build all workspaces
bun run lint             # ESLint across all workspaces
bun run test             # Run all tests
bun run format           # Prettier write (all files)
```

**Server (`app/server`):**

```bash
bun run dev              # Hot-reload dev server
bun run test             # Vitest unit tests
bun run generate         # Prisma Client codegen (run after schema changes)
bun run migrate          # prisma migrate dev
bun run deploy           # prisma migrate deploy (production)
bun run reset            # prisma migrate reset --force (destructive)
bun run create:director  # Seed a director account
bun run auth:generate    # Regenerate better-auth schema
```

**Web (`app/web`):**

```bash
bun run dev              # Vite dev server
bun run build            # vite build + tsc typecheck
bun run preview          # Preview production build
bun run test             # bun test
```

## Project Structure

```
app/
├── server/
│   ├── src/
│   │   ├── domain/              # Domain layer (no infra imports)
│   │   │   ├── entities/        # Citizen, Journalist, Director, Investigation, etc.
│   │   │   ├── value-objects/   # Media, VerifiedMedia, EvidenceMedia, etc.
│   │   │   ├── factories/       # Entity factories
│   │   │   ├── repositories/    # Repository interfaces (I*Repository.ts)
│   │   │   ├── processes/       # investigationStatusWorkflow, investigationReviewReadiness, investigationMediaCopy
│   │   │   └── events/          # Domain events
│   │   ├── application/
│   │   │   └── services/        # FactCheckingService (facade) + sub-workflow services
│   │   ├── infrastructure/
│   │   │   ├── config/          # Prisma config (modular schema via prismaSchemaFolder)
│   │   │   └── repositories/    # Prisma*Repository implementations
│   │   ├── interfaces/
│   │   │   ├── routes/          # Hono route definitions
│   │   │   ├── controllers/     # Request handlers
│   │   │   ├── http/schemas/    # Zod OpenAPI schemas
│   │   │   ├── auth/            # better-auth + actor linking
│   │   │   └── middlewares/     # Auth middleware
│   │   └── shared/              # Constants, types, errors, env
└── web/                         # React/Vite frontend (TanStack Router)

doc/                             # Documentation diagrams
├── class/                       # Class diagrams
├── usecase/                     # Use case diagrams
├── sequence/                    # Sequence diagrams
├── erd/                         # Entity-Relationship diagrams
└── ddd-summary.md               # DDD documentation

shared/                          # Shared constants, types, errors
├── constants.ts                 # Business rule constants
├── types.ts                     # Shared type definitions
└── errors.ts                    # Domain & business rule errors
```

## Documentation

Comprehensive UML diagrams are available in the `/doc` directory:

- **[Class Diagrams](doc/class/)** - Domain model and relationships
- **[Use Case Diagrams](doc/usecase/)** - System functionality by actor
- **[Sequence Diagrams](doc/sequence/)** - Interaction flows
- **[ERD](doc/erd/)** - Database schema and relationships
- **[DDD Summary](doc/ddd-summary.md)** - Domain-Driven Design documentation

## Role-Based Permissions Matrix

### Report & Investigation Management

| Permission            | Citizen | Journalist | Director | Notes                                           |
| :-------------------- | :-----: | :--------: | :------: | :---------------------------------------------- |
| Submit Report         |   ✅    |     ❌     |    ❌    | Max 3 open reports; Must be ACTIVE              |
| Submit Evidence       |   ✅    |     ❌     |    ❌    | Requires WATCHER type                           |
| Pick InboxSubject     |   ❌    |     ✅     |    ❌    | Max 1 active investigation; Subject must be OPEN |
| Draft Investigation   |   ❌    |     ✅     |    ❌    | Update media category, verdict, notes           |
| Submit for Review     |   ❌    |     ✅     |    ❌    | Must have media category set                    |
| Correct Investigation |   ❌    |     ✅     |    ❌    | After rejection; Limited attempts               |

### Validation & Publishing

| Permission             | Citizen | Journalist | Director | Notes                               |
| :--------------------- | :-----: | :--------: | :------: | :---------------------------------- |
| Validate Investigation |   ❌    |     ❌     |    ✅    | Approve or reject                   |
| Publish Result         |   ❌    |     ❌     |    ✅    | Only TRUE/FALSE/MISLEADING verdicts |
| Archive Investigation  |   ❌    |     ❌     |    ✅    | Only UNVERIFIABLE verdicts          |
| Reject for Revision    |   ❌    |     ❌     |    ✅    | Send back with feedback             |

### User & Watcher Management

| Permission                 | Citizen | Journalist | Director | Notes                   |
| :------------------------- | :-----: | :--------: | :------: | :---------------------- |
| Apply for Watcher          |   ✅    |     ❌     |    ❌    | Must be REGULAR citizen |
| Approve/Reject Watcher App |   ❌    |     ❌     |    ✅    | Review motivation       |
| Ban/Disable/Activate Users |   ❌    |     ❌     |    ✅    | All actor types         |
| Create Inbox Subjects      |   ❌    |     ❌     |    ✅    | Organizational topics   |

### Legend

- ✅ **Allowed** — Role has permission
- ❌ **Denied** — Role cannot perform action
- - **Conditional** — Requires additional criteria

## API Endpoints

### Authentication (`/api/auth/*`)

Handled by better-auth — `GET` and `POST /api/auth/*`.

### Reports

- `GET /api/reports/` - List reports (auth required)
- `POST /api/reports/` - Submit new report (permission: `report.submit`)

### Inbox Subjects

- `GET /api/inbox-subjects/` - List inbox subjects (auth required)
- `GET /api/inbox-subjects/report-inbox` - List open reports for journalists (permission: `report.pick`)
- `POST /api/inbox-subjects/` - Create director-initiated subject (permission: `inbox.manage`)
- `POST /api/inbox-subjects/:inboxSubjectId/pick` - Journalist picks subject, starts investigation (permission: `report.pick`)
- `DELETE /api/inbox-subjects/:inboxSubjectId` - Delete subject (permission: `inbox.manage`)

### Investigations

- `GET /api/investigations/` - List investigations (auth required)
- `POST /api/investigations/:investigationId/review` - Submit for director review (permission: `investigation.submitForReview`)
- `POST /api/investigations/:investigationId/source-media/:mediaId` - Classify source media item (permission: `investigation.update`)
- `POST /api/investigations/:investigationId/evidence/:evidenceId/media/:mediaId` - Classify watcher evidence media (permission: `investigation.update`)
- `POST /api/investigations/:investigationId/proof-media` - Add journalist proof media (permission: `investigation.update`)
- `POST /api/investigations/:investigationId/evidence` - Submit watcher evidence (permission: `evidence.submit`)
- `POST /api/investigations/:investigationId/approve` - Approve investigation (permission: `investigation.approve`)
- `POST /api/investigations/:investigationId/reject` - Reject → NEEDS_REVISION or CANCELED (permission: `investigation.reject`)
- `POST /api/investigations/:investigationId/archive` - Archive UNVERIFIABLE investigation (permission: `investigation.archive`)
- `POST /api/investigations/:investigationId/cancel` - Cancel investigation (permission: `investigation.cancel`)

### Publications

- `GET /api/publications/` - List publications (auth required)
- `POST /api/publications/:publicationId/corrections` - Publish a correction (permission: `publication.correct`)

### Watcher Applications

- `GET /api/watcher-applications/` - List applications (permission: `watcherApplication.decide`)
- `POST /api/watcher-applications/` - Apply for watcher status (permission: `watcher.apply`)
- `POST /api/watcher-applications/:applicationId/approve` - Approve application (permission: `watcherApplication.decide`)
- `POST /api/watcher-applications/:applicationId/reject` - Reject application (permission: `watcherApplication.decide`)

### Journalists / User Management

- `GET /api/journalists/` - List journalists (permission: `journalist.manage`)
- `POST /api/journalists/` - Create journalist account (permission: `journalist.manage`)
- `POST /api/journalists/:journalistId/ban` - Ban journalist (permission: `journalist.manage`)
- `POST /api/journalists/:journalistId/disable` - Disable journalist (permission: `journalist.manage`)
- `POST /api/journalists/:journalistId/activate` - Activate journalist (permission: `journalist.manage`)

### Director

- `GET /api/director/dashboard` - Director dashboard stats (permission: `director.dashboard.read`)
- `GET /api/director/citizens` - List citizens (permission: `journalist.manage`)

### Notifications

- `GET /api/notifications/` - List user notifications (permission: `notifications.read`)
- `POST /api/notifications/:notificationId/read` - Mark as read (permission: `notifications.read`)
- `POST /api/notifications/read-all` - Mark all as read (permission: `notifications.read`)

### Health

- `GET /health` - Health check (no auth)

### Environment var config for supabase media uploading

```sql
create policy "Allow public media uploads"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'fake-news-media'
  and name like 'uploads/%'
);
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ to combat misinformation and promote information integrity.**
