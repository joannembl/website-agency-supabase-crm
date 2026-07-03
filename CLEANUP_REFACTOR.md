# Service + Hook Cleanup Refactor

This refactor starts separating data access and business logic from `App.jsx` so the app can scale into feature modules.

## Added service files

- `src/features/leads/leadService.js`
  - Lead normalization
  - Fetch/create/update/delete leads
  - LocalStorage fallback helpers
  - Lead demo status helper

- `src/features/demos/demoBuilder.js`
  - Demo form normalization
  - Slug creation
  - HTML escaping
  - Demo brief generation
  - Demo site copy generation
  - Starter `index.html` generation

- `src/features/demos/demoService.js`
  - Fetch demo by lead
  - Upsert demo records
  - Save Build Demo V2 records
  - Update demo statuses

- `src/features/activities/activityService.js`
  - Fetch/create/delete activity notes
  - LocalStorage fallback helpers
  - Activity date formatting

## Added custom hooks

- `src/hooks/useAuthSession.js`
- `src/hooks/useTeams.js`
- `src/hooks/useLeads.js`
- `src/hooks/useActivities.js`
- `src/hooks/useDemos.js`

`App.jsx` now uses the auth/team/lead/activity hooks and imports demo builder helpers. Demo orchestration still lives mostly in `App.jsx` because it coordinates the modal, generated files, activities, lead updates, and toasts.

## Next cleanup after this

1. Move the remaining Demo Manager orchestration into `useDemos`.
2. Split route/view orchestration from `App.jsx` into `AppShell.jsx`.
3. Move modal open/close state into feature-level hooks.
4. Convert the project to TypeScript when the structure stabilizes.
5. Add shared types:
   - `Lead`
   - `Demo`
   - `Activity`
   - `Team`
   - `TeamMember`
