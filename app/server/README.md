# Server — Fake News Detector API

Hono API built with Domain-Driven Design, targeting Cloudflare Workers. See the
root [`README.md`](../../README.md) for the project overview and the
[`doc/`](../../doc/) folder for the domain and API reference.

## Layering (strict DDD)

```
src/
  interfaces/      HTTP boundary: Hono routes, controllers, presenters,
                   Zod OpenAPI schemas, better-auth wiring
  application/     Use-case orchestration: FactCheckingService (facade)
                   delegates to Citizen/Journalist/Director/Correction services
  domain/          Pure business logic: entities, value objects, repository
                   interfaces, domain processes, domain events (no infra)
  infrastructure/  Prisma repository implementations, DB config, EmailAdapter
  shared/          Cross-cutting: constants, types, errors, env
```

Dependencies point inward: `domain` never imports Hono, Prisma, or
infrastructure. Manual dependency injection lives in
`interfaces/createAppDependencies.ts` — the single place to wire new
repositories into services.

## Getting started

```bash
bun install
cp .env.example .env      # DB, better-auth, Supabase — see the file for details
bun run generate          # Prisma Client codegen
bun run migrate           # apply migrations (dev)
bun run create:director   # seed an initial director account
bun run dev               # hot-reload dev server on http://localhost:3000
```

## Scripts

```bash
bun run dev             # hot-reload dev server
bun run test            # Vitest unit tests
bun run lint            # ESLint
bun run generate        # Prisma Client codegen (run after any schema change)
bun run migrate         # prisma migrate dev (create + apply a migration)
bun run deploy          # prisma migrate deploy (apply migrations in production)
bun run reset           # prisma migrate reset --force (DESTRUCTIVE: wipes the DB)
bun run create:director # seed a director account
bun run auth:generate   # regenerate the better-auth schema
```

## Prisma schema

The schema is modular: one `.prisma` file per entity under
`src/infrastructure/config/prisma/models/`, assembled by the
`prismaSchemaFolder` preview feature with the root
`src/infrastructure/config/prisma/schema.prisma`. Run `bun run generate` after
any schema change.

## Media storage

Supabase Storage (bucket `fake-news-media`) holds uploaded media. The client
uploads and reads with the anon key; the **server is the only party allowed to
delete objects**, using the service-role key (never exposed to the client). All
deletion goes through the server so bucket objects are removed alongside their
DB rows.

The anon upload path is gated by a Storage RLS policy:

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

## Deployment

Cloudflare Workers via `wrangler.jsonc` at the repo root (entry
`app/server/src/index.ts`).
