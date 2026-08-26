# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Bun workspace monorepo. Root scripts fan out to every workspace with
`bun run --filter '*'`; target one app with `--filter server` or `--filter web`.

```bash
bun install
bun run dev                      # both apps
bun run --filter server dev      # Hono API, hot reload, :3000
bun run --filter web dev         # Vite SPA
bun run lint                     # ESLint, both
bun run format:check             # Prettier, both
```

Type checking is not wired into a script — run it the way CI does:

```bash
bunx tsc --noEmit -p app/server/tsconfig.json
bunx tsc --noEmit -p app/web/tsconfig.json
```

### Tests

The two apps use different runners.

```bash
bun run --filter server test                          # Vitest, all server tests
bunx vitest run src/domain/entities/Investigation.test.ts   # single file, from app/server/
bunx vitest run -t "cannot submit"                    # single test by name
bun run --filter web test                             # bun test
```

CI runs only the domain subset for the server (`bun test --filter server
src/domain/**/*.test.ts`), so `bun run --filter server test` is broader than the
gate — application-service tests can fail locally while CI stays green.

### Database (from `app/server/`)

Every Prisma command needs the explicit config flag; the scripts already carry it.

```bash
bun run generate          # Prisma Client codegen — required after ANY schema change
bun run migrate           # prisma migrate dev
bun run prisma:validate
bun run deploy            # prisma migrate deploy (production)
bun run reset             # DESTRUCTIVE: wipes the database
bun run create:director   # seed the first director account
bun run sweep             # dry-run orphaned-media reconciliation; --apply to execute
```

### CI gates

`.github/workflows/ci.yml` runs, per app: ESLint, `tsc --noEmit`, Prettier check,
build, plus Prisma generate/validate and the domain tests on the server side. A
separate `safets doctor --fail-on-new` job compares runtime-safety findings
against `.safets-baseline.json` — it fails on _new_ findings only, so the two
pre-existing entries in that baseline are expected. `ddd-review.yml` runs a
multi-agent DDD review when a PR is opened.

## Architecture

### Server — strict DDD (`app/server/src/`)

```
interfaces/      Hono routes → controllers → presenters, Zod OpenAPI schemas, better-auth
application/     Use-case orchestration
domain/          Entities, value objects, repository interfaces, processes, events
infrastructure/  Prisma repositories, DB config, Supabase adapter
shared/          constants, env, errors, types
```

Dependencies point inward. `domain/` imports neither Hono nor Prisma nor
anything from `infrastructure/`; it declares repository _interfaces_ that
`infrastructure/repositories/persistence/Prisma*Repository.ts` implement.

**`interfaces/createAppDependencies.ts` is the single wiring point.** All
dependency injection is manual and lives there — a new repository or service is
constructed and threaded through that file, nowhere else.

**`FactCheckingService` is a facade, not an implementation.** The real logic sits
in `application/services/fact-checking/`, split by actor:
`citizenWorkflowService`, `journalistWorkflowService`, `directorWorkflowService`,
`correctionWorkflowService`, with `investigationLifecycleService` owning the
cross-cutting side effects of a status change (archiving the subject and the
originating report, freeing the journalist's slot, fanning out notifications).
When a workflow changes, the facade is usually not the file to edit.

**Reusable business rules live in `domain/processes/`** —
`investigationStatusWorkflow` (legal status transitions),
`investigationReviewReadiness` (what makes a draft submittable),
`investigationMediaCopy` (how a subject's media are copied into a new
investigation). Put a rule there rather than in a service when more than one
caller needs it.

**Business thresholds are in `shared/constants.ts`**, not scattered in entities:
`MAX_REPORTING_PER_CITIZEN_AT_A_TIME`, `MAX_INVESTIGATIONS_PER_JOURNALIST_AT_A_TIME`,
`MAX_REVISION_ATTEMPTS`, `CITIZEN_NOTIFICATION_BATCH_SIZE`. Publication
notifications are written to every citizen in batches of that last constant.

### Prisma schema is modular

One `.prisma` file per entity under
`src/infrastructure/config/prisma/models/`, assembled by the `prismaSchemaFolder`
preview feature. The root `schema.prisma` holds only the generator and datasource
blocks — searching it for a model will find nothing. Run `bun run generate` after
any change.

### Identity is split in two

`better-auth` owns authentication and its own tables (`user`, `session`,
`account`, `verification`). The business actor lives in `actors`, with roles
flattened into one table discriminated by `role`. `auth_links` bridges the two in
a strict one-to-one. Never assume an auth user id is an actor id.

### Web — Feature-Sliced Design (`app/web/src/`)

`routes/` (TanStack Router, file-based) → `pages/` → `features/` → `entities/` →
`shared/`. TanStack Query holds server state, Zustand holds client state.

Two conventions the linter will not catch:

- Zod schemas in `entities/<name>/schemas.ts` **mirror the server** for every
  enum or union field — verdicts, statuses, media types. Never type a constrained
  field as a plain `string`; derive TS types with `z.infer<>`.
- `entities/` must not import from `pages/`. Fixture data belongs in
  `entities/<name>/fixtures.ts`.

### Media

Uploads and reads go client-side to Supabase Storage; **deletes are server-only**.
`sweepStorage.ts` reconciles the bucket against the database and is the only
sanctioned way to remove orphans.

## Reference documentation

- [`doc/ddd-summary.md`](doc/ddd-summary.md) — aggregates, invariants, lifecycles,
  enums, and the role-based permission matrix. The authority on domain behaviour.
- [`doc/api.md`](doc/api.md) — every HTTP endpoint with its required permission.
- [`doc/`](doc/) — the UML and Merise figures for the defense. `usecase/`,
  `class/` and `mpd/` are deliberately cut to the same perimeter (14 use cases →
  14 classes → 10 tables); each carries a README with the coverage table proving
  the mapping. Regenerate `.png`/`.svg` from the `.puml` rather than editing them.
