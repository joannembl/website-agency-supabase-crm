# Website Agency Supabase CRM

An internal Agency OS for running a demo-first local website agency. It combines prospecting, sales pipeline, demo website management, follow-ups, tasks, notifications, and team access on top of Supabase.

## MVP status

This repo is organized as a Vite + React app with Supabase Auth, Row Level Security, team roles, and modular feature folders. It is ready to use as an MVP after the Supabase migrations are applied and the required environment variables are configured.

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

Add these values to `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

## Supabase setup

Run the SQL files in this order:

1. `supabase/schema.sql`
2. `supabase/migrations/supabase-auth-migration.sql`
3. `supabase/migrations/supabase-team-migration.sql`
4. `supabase/migrations/supabase-roles-migration.sql`
5. `supabase/migrations/supabase-activity-notes-migration.sql`
6. `supabase/migrations/supabase-demo-manager-migration.sql`
7. `supabase/migrations/supabase-follow-up-engine-migration.sql`
8. `supabase/migrations/supabase-task-management-migration.sql`
9. `supabase/migrations/supabase-notifications-migration.sql`

Then create your first user through the app, create/join a team, and make yourself `owner` if needed.

## Deploy

This is a Vite app. Use:

```bash
pnpm run build
```

Publish directory:

```bash
dist
```

Required hosting environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

For GitHub Pages, make sure `vite.config.ts` has the correct `base` value for your repo name.

## Documentation

- `docs/MVP_CHECKLIST.md` — what must be true before calling this MVP-ready
- `docs/ROADMAP.md` — planned sprint roadmap
- `docs/setup/SUPABASE_SETUP.md` — Supabase setup and RLS notes
- `docs/architecture/ARCHITECTURE.md` — app structure and conventions
- `docs/features/` — feature implementation notes
- `docs/archive/` — older refactor notes kept for historical reference

## Current MVP features

- Supabase Auth
- Team creation and invite codes
- Owner/Admin/Member roles
- Secure team-based RLS patterns
- Prospects CRM
- Kanban pipeline with drag/drop
- Jira-style prospect card workspace/modal flow
- Full prospect workspace framework
- Activity notes
- Demo Website Manager
- Build Demo Website V2 template generator
- Follow-up engine
- Task management
- Notifications
- Global search / command palette
- Shared design system and SaaS shell layout

## Package manager

This repo standardizes on `pnpm`. Do not commit `node_modules`, `dist`, `.env`, or generated build artifacts.
