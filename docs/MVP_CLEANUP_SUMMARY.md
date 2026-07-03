# MVP Cleanup Summary

This cleanup pass prepares the repo to be treated as an internal MVP.

## Repo cleanup

- Added `.gitignore` for dependencies, builds, env files, and local artifacts.
- Standardized package management on `pnpm`.
- Removed root-level doc clutter by moving feature/refactor notes into `docs/`.
- Organized Supabase setup under `supabase/`.
- Added MVP checklist, roadmap, setup, architecture, and contributing docs.

## Code cleanup

- Moved the application modal stack into `src/features/app/AppModals.jsx`.
- Kept `App.jsx` focused on app-level state, routing/view selection, and shared handlers.
- Preserved feature-folder architecture, custom hooks, service files, design system, and entity workspace framework.

## Still recommended after MVP

- Migrate JavaScript to TypeScript.
- Add automated linting/formatting.
- Add tests for services/hooks.
- Move more App-level business handlers into feature-specific controllers/hooks.
- Add CI checks for build and formatting.
