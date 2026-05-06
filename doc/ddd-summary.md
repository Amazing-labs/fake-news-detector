# DDD Domain Summary - Fake News Detector

## 🎯 Project Overview

**Fake News Detector** is a fact-checking platform that enables collaborative verification of news and information through a structured workflow involving Citizens, Journalists, and Editorial Directors.

---

## 🏗️ Architecture Overview

### Bounded Context

- **Core Domain**: Fact-checking workflow and content verification
- **Supporting Domains**: User management, notifications, watcher applications

---

## 👥 Domain Actors (Aggregates)

### 1. Actor (Base Entity)

The central entity unifying all user types via the `role` field.

**Attributes:**

- `id`: Unique identifier
- `name`, `email`: Contact information
- `role`: CITIZEN | JOURNALIST | EDITORIAL_DIRECTOR
- `status`: ACTIVE | DISABLED | BANNED
- `citizenType`: REGULAR | WATCHER
- `engagementScore`: User activity metric

**Behaviors:**

- `isActive()`, `canLogin()`
- `incrementEngagementScore()`
- `markInboxAsRead()`

### 2. Citizen (extends Actor)

Regular users who submit reports and can become Watchers.

**Invariants:**

- Max 3 open reports simultaneously
- Must be WATCHER to submit evidence

**Behaviors:**

- `submitReport()`, `submitEvidence()`
- `applyForWatcher()`, `promoteToWatcher()`

### 3. Journalist (extends Actor)

Users who investigate reports and produce verifications.

**Invariants:**

- Max 1 active investigation at a time

**Behaviors:**

- `pickReport()`, `submitInvestigationDraft()`
- `submitForReview()`, `correctInvestigation()`

### 4. Director (extends Actor)

Editorial directors who validate and publish investigations.

**Behaviors:**

- `validateInvestigation()`, `rejectInvestigation()`
- `publishInvestigation()`, `markAsUnverifiable()`
- `manageUsers()`, `approveWatcherApplication()`

---

## 📦 Core Domain Entities

### Report

A user-submitted claim to be verified.

**Attributes:**

- `theme`, `title`, `content`
- `status`: OPEN | IN_PROGRESS | RESOLVED
- `citizenId`: Submitter reference

**Invariants:**

- Can only be picked if status is OPEN
- Citizen must have available report slots

### Investigation

The fact-checking process for a Report.

**Attributes:**

- `mediaCategory`: Category of media being checked
- `draftVerdict`: TRUE | FALSE | UNVERIFIABLE
- `investigationNotes`: Detailed analysis
- `attemptCount`: Number of correction cycles
- `status`: DRAFT | PENDING_REVIEW | PUBLISHED

**Lifecycle:**

1. DRAFT → Journalist works on investigation
2. PENDING_REVIEW → Submitted for Director validation
3. PUBLISHED → Approved and public

### Evidence

Supporting documentation submitted by Watchers.

**Attributes:**

- `content`, `title`
- `investigationId`: Linked investigation
- `watcherId`: Submitter (must be WATCHER type)

### Publication

Final published result of an investigation.

**Attributes:**

- `finalVerdict`: TRUE | FALSE | UNVERIFIABLE
- `publishedAt`: Publication timestamp
- `isCorrection`: Whether this corrects a previous publication
- `approvedById`: Validating Director

---

## 🔗 Domain Relationships

```
Citizen 1--* Report (submits)
Report 1--0..1 Investigation (becomes)
Journalist 1--* Investigation (conducts)
Investigation 1--* Evidence (contains)
Evidence *--1 Citizen/Watcher (submitted by)
Investigation 1--0..1 Publication (produces)
Publication 1--* Notification (generates)
Director 1--* InboxSubject (manages)
Citizen 1--0..1 WatcherApplication (applies for)
```

---

## ⚠️ Critical Business Rules (Invariants)

1. **Citizen Report Limit**: Max 3 open reports per citizen
2. **Journalist Investigation Limit**: Max 1 active investigation per journalist
3. **Evidence Submission**: Only WATCHER citizens can submit evidence
4. **Watcher Promotion**: Requires Director approval via WatcherApplication
5. **Investigation Publication**: Only Director can approve and publish
6. **Correction Chain**: Publications can be corrected with `isCorrection` flag

---

## 🎭 Role-Based Permissions Matrix

### 📋 Report & Evidence Management

| Permission            | Citizen | Journalist | Director | Notes                  |
| :-------------------- | :-----: | :--------: | :------: | :--------------------- |
| Submit Report         |   ✅    |     ❌     |    ❌    | Max 3 open reports     |
| Submit Evidence       |   ✅    |     ❌     |    ❌    | Watcher role required  |
| Pick Report           |   ❌    |     ✅     |    ❌    | Status must be OPEN    |
| Conduct Investigation |   ❌    |     ✅     |    ❌    | Max 1 active at a time |

### ✅ Validation & Publishing

| Permission             | Citizen | Journalist | Director | Notes                  |
| :--------------------- | :-----: | :--------: | :------: | :--------------------- |
| Draft Investigation    |   ❌    |     ✅     |    ❌    | Initial analysis phase |
| Submit for Review      |   ❌    |     ✅     |    ❌    | Send to Director       |
| Validate Investigation |   ❌    |     ❌     |    ✅    | Approve/reject         |
| Publish Result         |   ❌    |     ❌     |    ✅    | Final publication      |
| Mark Unverifiable      |   ❌    |     ❌     |    ✅    | Cannot be verified     |
| Publish Correction     |   ❌    |     ❌     |    ✅    | Fix published content  |

### 👥 User Management

| Permission           | Citizen | Journalist | Director | Notes               |
| :------------------- | :-----: | :--------: | :------: | :------------------ |
| Ban/Disable Users    |   ❌    |     ❌     |    ✅    | All actor types     |
| Activate Users       |   ❌    |     ❌     |    ✅    | Reactivate accounts |
| Approve Watcher Apps |   ❌    |     ❌     |    ✅    | Promote citizens    |
| Create Inbox Topics  |   ❌    |     ❌     |    ✅    | Manage subjects     |

### 📊 Legend

- ✅ **Allowed** — Role has permission
- ❌ **Denied** — Role cannot perform action

---

## 📊 Enums & Value Objects

### Role

- CITIZEN, JOURNALIST, EDITORIAL_DIRECTOR

### AccountStatus

- ACTIVE, DISABLED, BANNED

### CitizenType

- REGULAR, WATCHER

### ReportStatus

- OPEN, IN_PROGRESS, RESOLVED

### InvestigationStatus

- DRAFT, PENDING_REVIEW, PUBLISHED

### Verdict

- TRUE, FALSE, UNVERIFIABLE

---

## 🔍 Anti-Patterns to Detect

1. **Anemic Domain Model**: Entities with only getters/setters, no business logic
2. **God Services**: Application services with too many responsibilities
3. **Repository Leakage**: Domain logic in repositories
4. **Missing Invariants**: Business rules not enforced in domain layer
5. **Wrong Layer Access**: Infrastructure directly accessed from domain
