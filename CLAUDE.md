# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Monorepo (root)

```bash
bun run dev          # Start all workspace dev servers in parallel
bun run build        # Build all workspaces
bun run lint         # ESLint across all workspaces
bun run test         # Run all workspace tests
bun run format       # Prettier write (all files)
bun run format:check # Prettier check only
```

### Server (`app/server`)

```bash
bun run dev                # Hot-reload dev server
bun run test               # Vitest unit tests (run from app/server for server-only tests)
bun run lint               # ESLint
bun run generate           # Prisma Client codegen (needed after schema changes)
bun run migrate            # prisma migrate dev (creates and applies a new migration)
bun run deploy             # prisma migrate deploy (apply migrations in production)
bun run reset              # prisma migrate reset --force (destructive: wipes DB)
bun run create:director    # Seed script: creates a director account
bun run auth:generate      # Regenerate better-auth schema
```

### Web (`app/web`)

```bash
bun run dev     # Vite dev server
bun run build   # vite build + tsc -b typecheck
bun run preview # Preview production build locally
bun run test    # bun test
bun run lint    # ESLint
```

## Architecture

This is a **Bun monorepo** with the following workspace groups (declared in root `package.json`):

- `app/server` — Hono API (DDD, Cloudflare Workers target)
- `app/web` — React 19 SPA (TanStack Router + Query, Vite)
- `packages/*` — Shared packages (directory exists in workspace config; currently unpopulated)

### Backend: Strict DDD Layering

```text
app/server/src/
  interfaces/      ← HTTP boundary: Hono routes, controllers, presenters, Zod OpenAPI schemas, auth
  application/     ← Use-case orchestration: FactCheckingService (facade) delegates to
                      Citizen/Journalist/Director/CorrectionWorkflowService
  domain/          ← Pure business logic: entities, value objects, repository interfaces,
                      domain processes, domain events (no infrastructure imports)
  infrastructure/  ← Prisma repository implementations, DB config, EmailAdapter
  shared/          ← Cross-cutting: constants, types, errors, env
```

**Dependency injection** is manual: `interfaces/createAppDependencies.ts` wires all Prisma repositories into application services and controllers — no DI container. This is the single place to add new wiring.

**Domain processes** (`domain/processes/`) encode business rules that span multiple entities: `investigationStatusWorkflow`, `investigationReviewReadiness`, `investigationMediaCopy`. Keep these pure (no I/O).

**Repository pattern:** Domain defines interfaces (`domain/repositories/I*Repository.ts`); Prisma implementations live in `infrastructure/repositories/persistence/Prisma*Repository.ts`. Application and domain code depend only on the interfaces.

**Prisma schema** is modular: individual `.prisma` files per entity live in `app/server/src/infrastructure/config/prisma/models/`. Prisma's `prismaSchemaFolder` preview feature assembles them with the root `app/server/src/infrastructure/config/prisma/schema.prisma` at codegen time. After any schema change run `bun run generate` in `app/server`.

### Frontend: Feature-Sliced Design (FSD)-influenced

```text
app/web/src/
  routes/     ← TanStack Router file-based routes
  pages/      ← Page-level components
  features/   ← Self-contained feature forms (create-report-form, auth-form, etc.)
  entities/   ← Domain entity API calls + Zustand store models
  shared/api/ ← Base HTTP client (http.ts) and React Query client setup
  shared/ui/  ← Shadcn/UI component library (Radix + Tailwind)
  lib/        ← auth-client.ts, auth-config.ts
```

Data fetching uses **TanStack Query** for server state and **Zustand** for client state. API calls are defined in `entities/<name>/api/`.

### Authentication

**better-auth** manages sessions server-side under `/api/auth/*`. The session object carries custom fields: `actorId`, `actorRole`, `actorStatus`, `citizenType`. `interfaces/auth/authLinking.ts` links better-auth users to domain actors. On the frontend, `lib/auth-client.ts` exposes the better-auth React client.

### Media Storage

Supabase Storage (bucket `fake-news-media`) handles file uploads from the web client via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The server does not directly touch Supabase Storage.

### Deployment

- **Server:** Cloudflare Workers (`wrangler.jsonc`, entry: `app/server/src/index.ts`)
- **Web:** Vercel (`@vercel/analytics` in use)

## Key Conventions

- **TypeScript strict mode** everywhere. The CI `safets` job runs `bunx safets doctor --fail-on-new` to prevent runtime type safety regressions.
- **Zod v4** is used for validation on both client and server. Server routes use `@hono/zod-openapi` for schema-driven route definitions.
- **ESLint + Prettier** are co-configured (prettier runs as an ESLint rule). Run `bun run format` before committing if linting fails on formatting.
- Domain entities and value objects must remain framework-free. Never import Hono, Prisma, or infrastructure code into `domain/`.
- New API endpoints follow the pattern: Zod schema in `interfaces/http/schemas/` → route in `interfaces/routes/` → controller method → application service → domain.
