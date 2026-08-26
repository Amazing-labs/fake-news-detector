# Fake News Detector

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-black.svg)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-19-149eca.svg)](https://react.dev/)
[![Hono](https://img.shields.io/badge/Hono-4-e36002.svg)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

> A collaborative fact-checking platform where citizens report suspicious content, journalists investigate it with a professional methodology, and editorial directors validate and publish transparent verdicts.

## What it does

Misinformation spreads faster than it can be checked. Fake News Detector turns public alerts into verifiable evidence through one structured workflow shared by three roles:

- **Citizens** report suspicious content and, once promoted to _Watcher_, contribute evidence to ongoing investigations.
- **Journalists** pick subjects, investigate them, classify the media, and submit a draft verdict for review.
- **Editorial Directors** validate investigations, then publish, archive, or send them back for correction.

## The workflow in one picture

```
Report ──▶ InboxSubject ──▶ Investigation ──▶ Review ──▶ Publication
 (citizen)   (editorial     (journalist,      (director)   (verdict:
             backlog)        origin-tagged                  TRUE/FALSE/
                             media)                          MISLEADING)
                                                            └▶ Archived
                                                               (UNVERIFIABLE)
```

Reports become editorial _InboxSubjects_; a journalist picks one to open an _Investigation_; _Watchers_ may add evidence; the director reviews and either publishes a verdict, archives an unverifiable case, or requests a revision. The full state machine, invariants, and permission matrix live in [`doc/ddd-summary.md`](doc/ddd-summary.md).

## Tech stack

| Layer                      | Choices                                                                          |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Frontend** (`app/web`)   | React 19, TanStack Router + Query, Zustand, Vite, Tailwind v4, shadcn/ui, sonner |
| **Backend** (`app/server`) | Hono, Domain-Driven Design, Zod v4 + `@hono/zod-openapi`, better-auth            |
| **Data**                   | PostgreSQL via Prisma 7 (modular schema)                                         |
| **Media**                  | Supabase Storage (client uploads/reads; server-only deletes)                     |
| **Runtime & deploy**       | Bun monorepo · server → Cloudflare Workers · web → Vercel                        |

## Monorepo layout

```
app/
  server/   Hono API — DDD layering, Cloudflare Workers target
  web/      React 19 SPA — Feature-Sliced Design
packages/   Shared packages (reserved)
doc/        Domain summary, API reference, art direction, UML diagrams
```

The backend follows strict DDD (`domain` → `application` → `infrastructure` / `interfaces`); the frontend follows a Feature-Sliced Design layout (`routes`, `pages`, `features`, `entities`, `shared`). See [`app/server/README.md`](app/server/README.md) and [`app/web/README.md`](app/web/README.md) for per-app details.

## Quickstart

**Prerequisites:** [Bun](https://bun.sh/) 1.3+, PostgreSQL 15+, Git.

```bash
# 1. Clone and install
git clone https://github.com/Amazing-labs/fake-news-detector.git
cd fake-news-detector
bun install

# 2. Configure environment
cp app/server/.env.example app/server/.env   # DB, better-auth, Supabase (see file)
cp app/web/.env.example app/web/.env          # Supabase + auth/API base URLs

# 3. Set up the database (from app/server)
cd app/server
bun run generate        # Prisma Client codegen
bun run migrate         # apply migrations (dev)
bun run create:director # seed an initial director account

# 4. Start every workspace from the repo root
cd ../..
bun run dev
```

## Common scripts

Run from the repo root:

```bash
bun run dev          # start all workspaces
bun run build        # build all workspaces
bun run lint         # ESLint across the monorepo
bun run test         # run all tests
bun run format       # Prettier write
```

Per-app scripts (Prisma, migrations, auth codegen, Vite preview, …) are documented in each app's README.

## Documentation

Everything deeper than this front door lives in [`doc/`](doc/):

- **[Domain summary](doc/ddd-summary.md)** — aggregates, entities, invariants, lifecycles, enums, and the role-based permission matrix.
- **[API reference](doc/api.md)** — every HTTP endpoint with its required permission.
- **[Art direction](doc/art-direction.md)** — visual identity and screens to design.
- **UML & Merise diagrams** — [use case](doc/usecase/), [class](doc/class/), [MPD](doc/mpd/), [sequence](doc/sequence/), and [activity](doc/activity/) (PlantUML).

## Deployment

- **Server** → Cloudflare Workers (`wrangler.jsonc`, entry `app/server/src/index.ts`).
- **Web** → Vercel.

## Contributing

Commit messages and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/) in English, with the PR number in parentheses — e.g. `feat(web): add notification popover (#57)`. Run `bun run format` and `bun run lint` before opening a PR.

## License

MIT.

---

**Built to combat misinformation and promote information integrity.**
