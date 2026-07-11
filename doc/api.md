# API Reference

All routes are served under `/api`. Every route requires a valid better-auth
session; the **Permission** column lists the additional role capability enforced
by the route middleware (`auth` means an authenticated session is sufficient).
See the permission matrix in [`ddd-summary.md`](ddd-summary.md) for how
capabilities map to roles.

## Authentication — `/api/auth/*`

Handled by better-auth (`GET` and `POST /api/auth/*`): sign-up, sign-in,
sign-out, session. The session carries the custom fields `actorId`, `actorRole`,
`actorStatus`, and `citizenType`.

## Reports — `/api/reports`

| Method & path           | Permission      | Description           |
| ----------------------- | --------------- | --------------------- |
| `GET /`                 | auth            | List reports          |
| `GET /{reportId}`       | auth            | Get a single report   |
| `GET /{reportId}/media` | auth            | List a report's media |
| `POST /`                | `report.submit` | Submit a new report   |

## Inbox subjects — `/api/inbox-subjects`

| Method & path                 | Permission     | Description                                           |
| ----------------------------- | -------------- | ----------------------------------------------------- |
| `GET /`                       | `inbox.read`   | List inbox subjects                                   |
| `GET /report-inbox`           | `report.pick`  | List open reports for journalists                     |
| `GET /{inboxSubjectId}`       | `inbox.read`   | Get a single inbox subject                            |
| `GET /{inboxSubjectId}/media` | `inbox.read`   | List an inbox subject's media                         |
| `POST /`                      | `inbox.manage` | Create a director-initiated subject                   |
| `POST /{inboxSubjectId}/pick` | `report.pick`  | Journalist picks a subject and opens an investigation |
| `DELETE /{inboxSubjectId}`    | `inbox.manage` | Delete a subject (server also purges its media)       |

## Investigations — `/api/investigations`

| Method & path                                                   | Permission                      | Description                                 |
| --------------------------------------------------------------- | ------------------------------- | ------------------------------------------- |
| `GET /`                                                         | auth                            | List investigations                         |
| `GET /{investigationId}`                                        | auth                            | Get a single investigation                  |
| `GET /{investigationId}/source-media`                           | auth                            | List the investigation's source media       |
| `GET /{investigationId}/evidence`                               | auth                            | List the investigation's evidence           |
| `POST /{investigationId}/review`                                | `investigation.submitForReview` | Submit for director review                  |
| `POST /{investigationId}/draft`                                 | `investigation.update`          | Update the draft (category, verdict, notes) |
| `POST /{investigationId}/source-media/{mediaId}`                | `investigation.update`          | Classify a source media item                |
| `POST /{investigationId}/evidence/{evidenceId}/media/{mediaId}` | `investigation.update`          | Classify a watcher evidence media item      |
| `POST /{investigationId}/proof-media`                           | `investigation.update`          | Add journalist proof media                  |
| `POST /{investigationId}/evidence`                              | `evidence.submit`               | Submit watcher evidence                     |
| `POST /{investigationId}/approve`                               | `investigation.approve`         | Approve → PUBLISHED                         |
| `POST /{investigationId}/reject`                                | `investigation.reject`          | Reject → NEEDS_REVISION or CANCELED         |
| `POST /{investigationId}/archive`                               | `investigation.archive`         | Archive an UNVERIFIABLE investigation       |
| `POST /{investigationId}/cancel`                                | `investigation.cancel`          | Cancel an investigation                     |

## Publications — `/api/publications`

| Method & path                       | Permission            | Description                      |
| ----------------------------------- | --------------------- | -------------------------------- |
| `GET /`                             | auth                  | List publications                |
| `GET /{publicationId}`              | auth                  | Get a single publication         |
| `GET /{publicationId}/corrections`  | auth                  | List a publication's corrections |
| `POST /{publicationId}/corrections` | `publication.correct` | Publish a correction             |

## Watcher applications — `/api/watcher-applications`

| Method & path                   | Permission                  | Description              |
| ------------------------------- | --------------------------- | ------------------------ |
| `GET /`                         | `watcherApplication.decide` | List applications        |
| `GET /{applicationId}`          | `watcherApplication.decide` | Get a single application |
| `POST /`                        | `watcher.apply`             | Apply for watcher status |
| `POST /{applicationId}/approve` | `watcherApplication.decide` | Approve an application   |
| `POST /{applicationId}/reject`  | `watcherApplication.decide` | Reject an application    |

## Journalists — `/api/journalists`

| Method & path                   | Permission          | Description                 |
| ------------------------------- | ------------------- | --------------------------- |
| `GET /`                         | `journalist.manage` | List journalists            |
| `POST /`                        | `journalist.manage` | Create a journalist account |
| `POST /{journalistId}/ban`      | `journalist.manage` | Ban a journalist            |
| `POST /{journalistId}/disable`  | `journalist.manage` | Disable a journalist        |
| `POST /{journalistId}/activate` | `journalist.manage` | Activate a journalist       |

## Director — `/api/director`

| Method & path                         | Permission                | Description               |
| ------------------------------------- | ------------------------- | ------------------------- |
| `GET /dashboard`                      | `director.dashboard.read` | Director dashboard stats  |
| `GET /decisions`                      | `director.dashboard.read` | Director decision history |
| `GET /citizens`                       | `citizen.manage`          | List citizens             |
| `POST /citizens/{citizenId}/ban`      | `citizen.manage`          | Ban a citizen             |
| `POST /citizens/{citizenId}/disable`  | `citizen.manage`          | Disable a citizen         |
| `POST /citizens/{citizenId}/activate` | `citizen.manage`          | Activate a citizen        |

## Current actor — `/api/me`

| Method & path        | Permission | Description                                |
| -------------------- | ---------- | ------------------------------------------ |
| `GET /`              | auth       | Get the current actor's profile            |
| `GET /contributions` | auth       | Get the current actor's contribution stats |

## Dashboard — `/api/dashboard`

| Method & path  | Permission | Description                  |
| -------------- | ---------- | ---------------------------- |
| `GET /metrics` | auth       | Role-aware dashboard metrics |

## Notifications — `/api/notifications`

| Method & path                 | Permission           | Description                            |
| ----------------------------- | -------------------- | -------------------------------------- |
| `GET /`                       | `notifications.read` | List the current actor's notifications |
| `POST /read-all`              | `notifications.read` | Mark all as read                       |
| `POST /{notificationId}/read` | `notifications.read` | Mark one as read                       |

## Media — `/api/media`

| Method & path   | Permission      | Description                                   |
| --------------- | --------------- | --------------------------------------------- |
| `POST /cleanup` | auth            | Remove specified bucket objects               |
| `POST /sweep`   | `storage.sweep` | Reconciliation sweep of orphaned bucket media |

## Health

| Method & path | Permission | Description    |
| ------------- | ---------- | -------------- |
| `GET /health` | none       | Liveness check |

---

Routes are defined with `@hono/zod-openapi`, so request params and bodies are
validated at the route layer before a controller runs. Domain and business-rule
errors are translated to French at the HTTP boundary; see
`interfaces/http/errorMessages.ts`.
