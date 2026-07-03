# MVP Checklist

Use this checklist before calling the app MVP-ready.

## Repository hygiene

- [x] `node_modules/` is excluded from git.
- [x] `dist/` is excluded from git.
- [x] Only one package manager is used (`pnpm`).
- [x] Root docs are organized into `docs/`.
- [x] SQL setup files are organized under `supabase/`.
- [x] `.env.example` exists and does not contain secrets.
- [ ] GitHub repo has `node_modules/` removed from tracking.
- [ ] GitHub repo has `dist/` removed from tracking unless intentionally deploying a static build branch.

## App requirements

- [x] User can sign up/sign in.
- [x] User can create or join a team.
- [x] Owner/Admin/Member roles exist.
- [x] Owner can manage team roles.
- [x] Prospects can be created, edited, moved, and deleted.
- [x] Pipeline supports Kanban workflow.
- [x] Activity notes can be logged per prospect.
- [x] Demo Website Manager tracks preview/live/GitHub/status/notes.
- [x] Build Demo Website V2 can generate copy and starter HTML.
- [x] Follow-up dates and notes are supported.
- [x] Tasks can be created, completed, reopened, and linked to prospects.
- [x] Notifications work without UUID `undefined` errors.
- [x] Global search/command palette opens with Cmd/Ctrl+K.

## Security requirements

- [x] Frontend uses anon/publishable key only.
- [x] Service role key is not used in frontend.
- [x] CRM tables use RLS.
- [x] Leads are team-scoped.
- [x] Activities are team-scoped through leads.
- [x] Demos/clients are protected through linked leads.
- [ ] Open public anon policies have been audited in production Supabase.
- [ ] Email confirmation policy is decided.
- [ ] Open signup policy is decided.

## MVP decision

This is MVP-ready for internal use when:

1. Supabase migrations are applied cleanly.
2. A test user can create a team, add prospects, add tasks, set follow-ups, update demos, and receive notifications.
3. The production repo does not track `node_modules`, `dist`, `.env`, or local artifacts.
