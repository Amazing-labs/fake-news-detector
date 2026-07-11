# Web — Fake News Detector SPA

React 19 single-page app built with Vite and a Feature-Sliced Design layout. See
the root [`README.md`](../../README.md) for the project overview and
[`doc/art-direction.md`](../../doc/art-direction.md) for the visual identity.

## Stack

- **React 19** with **TanStack Router** (file-based routes) and **TanStack Query** (server state)
- **Zustand** for client state
- **Tailwind v4** + **shadcn/ui** (Radix) components, **sonner** for toasts
- **better-auth** React client, **Zod v4** for validation
- **Vite** dev server and build

## Layout (Feature-Sliced Design)

```
src/
  routes/     TanStack Router file-based routes
  pages/      Page-level components
  features/   Self-contained feature forms (create-report, auth, …)
  entities/   Domain entity API calls + Zustand stores + Zod schemas
  shared/api/ Base HTTP client and React Query setup
  shared/ui/  shadcn/ui component library
  lib/        auth-client, auth-config
```

Conventions worth knowing:

- Client-side Zod schemas in `entities/<name>/schemas.ts` **mirror the server**
  for every enum/union field (verdicts, statuses, media types, …). Never type a
  constrained field as a plain `string`; derive TS types with `z.infer<>`.
- `entities/` must not import from `pages/`. Fixture data belongs in
  `entities/<name>/fixtures.ts`.

## Getting started

```bash
bun install
cp .env.example .env   # Supabase + auth/API base URLs — see the file
bun run dev            # Vite dev server
```

The dev server proxies API calls to the backend; set `VITE_SERVER_PROXY_TARGET`
in `.env` to point at your running server.

## Scripts

```bash
bun run dev      # Vite dev server
bun run build    # vite build + tsc -b typecheck
bun run preview  # preview the production build locally
bun run test     # bun test
bun run lint     # ESLint
```

## Deployment

Vercel (`@vercel/analytics` in use).
