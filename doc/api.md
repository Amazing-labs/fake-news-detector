# API Reference

All routes are served under `/api`. Unless noted otherwise, a request must carry
a valid better-auth session. Endpoints that enforce a role capability list the
required permission (see the permission matrix in
[`ddd-summary.md`](ddd-summary.md)).

## Authentication — `/api/auth/*`

Handled by better-auth (`GET` and `POST /api/auth/*`): sign-up, sign-in,
sign-out, session. The session carries the custom fields `actorId`, `actorRole`,
`actorStatus`, and `citizenType`.

## Reports

| Method & path        | Permission      | Description         |
| -------------------- | --------------- | ------------------- |
| `GET /api/reports/`  | auth            | List reports        |
| `POST /api/reports/` | `report.submit` | Submit a new report |

## Inbox subjects

| Method & path                                   | Permission     | Description                                           |
| ----------------------------------------------- | -------------- | ----------------------------------------------------- |
| `GET /api/inbox-subjects/`                      | auth           | List inbox subjects                                   |
| `GET /api/inbox-subjects/report-inbox`          | `report.pick`  | List open reports for journalists                     |
| `POST /api/inbox-subjects/`                     | `inbox.manage` | Create a director-initiated subject                   |
| `POST /api/inbox-subjects/:inboxSubjectId/pick` | `report.pick`  | Journalist picks a subject and opens an investigation |
| `DELETE /api/inbox-subjects/:inboxSubjectId`    | `inbox.manage` | Delete a subject (server also purges its media)       |

## Investigations

| Method & path                                                                   | Permission                      | Description                            |
| ------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------- |
| `GET /api/investigations/`                                                      | auth                            | List investigations                    |
| `POST /api/investigations/:investigationId/review`                              | `investigation.submitForReview` | Submit for director review             |
| `POST /api/investigations/:investigationId/source-media/:mediaId`               | `investigation.update`          | Classify a source media item           |
| `POST /api/investigations/:investigationId/evidence/:evidenceId/media/:mediaId` | `investigation.update`          | Classify a watcher evidence media item |
| `POST /api/investigations/:investigationId/proof-media`                         | `investigation.update`          | Add journalist proof media             |
| `POST /api/investigations/:investigationId/evidence`                            | `evidence.submit`               | Submit watcher evidence                |
| `POST /api/investigations/:investigationId/approve`                             | `investigation.approve`         | Approve → PUBLISHED                    |
| `POST /api/investigations/:investigationId/reject`                              | `investigation.reject`          | Reject → NEEDS_REVISION or CANCELED    |
| `POST /api/investigations/:investigationId/archive`                             | `investigation.archive`         | Archive an UNVERIFIABLE investigation  |
| `POST /api/investigations/:investigationId/cancel`                              | `investigation.cancel`          | Cancel an investigation                |

## Publications

| Method & path                                       | Permission            | Description          |
| --------------------------------------------------- | --------------------- | -------------------- |
| `GET /api/publications/`                            | auth                  | List publications    |
| `POST /api/publications/:publicationId/corrections` | `publication.correct` | Publish a correction |

## Watcher applications

| Method & path                                           | Permission                  | Description              |
| ------------------------------------------------------- | --------------------------- | ------------------------ |
| `GET /api/watcher-applications/`                        | `watcherApplication.decide` | List applications        |
| `POST /api/watcher-applications/`                       | `watcher.apply`             | Apply for watcher status |
| `POST /api/watcher-applications/:applicationId/approve` | `watcherApplication.decide` | Approve an application   |
| `POST /api/watcher-applications/:applicationId/reject`  | `watcherApplication.decide` | Reject an application    |

## Journalists & user management

| Method & path                                  | Permission          | Description                 |
| ---------------------------------------------- | ------------------- | --------------------------- |
| `GET /api/journalists/`                        | `journalist.manage` | List journalists            |
| `POST /api/journalists/`                       | `journalist.manage` | Create a journalist account |
| `POST /api/journalists/:journalistId/ban`      | `journalist.manage` | Ban a journalist            |
| `POST /api/journalists/:journalistId/disable`  | `journalist.manage` | Disable a journalist        |
| `POST /api/journalists/:journalistId/activate` | `journalist.manage` | Activate a journalist       |

## Director

| Method & path                 | Permission                | Description              |
| ----------------------------- | ------------------------- | ------------------------ |
| `GET /api/director/dashboard` | `director.dashboard.read` | Director dashboard stats |
| `GET /api/director/citizens`  | `journalist.manage`       | List citizens            |

## Notifications

| Method & path                                  | Permission           | Description                            |
| ---------------------------------------------- | -------------------- | -------------------------------------- |
| `GET /api/notifications/`                      | `notifications.read` | List the current actor's notifications |
| `POST /api/notifications/:notificationId/read` | `notifications.read` | Mark one as read                       |
| `POST /api/notifications/read-all`             | `notifications.read` | Mark all as read                       |

## Health

| Method & path | Permission | Description    |
| ------------- | ---------- | -------------- |
| `GET /health` | none       | Liveness check |

---

Routes are defined with `@hono/zod-openapi`, so request params and bodies are
validated at the route layer before a controller runs. Domain and business-rule
errors are translated to French at the HTTP boundary; see
`interfaces/http/errorMessages.ts`.
