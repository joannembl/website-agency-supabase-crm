# Code Structure

The app has been split so `src/main.jsx` is only the React entry point.

## Key files

- `src/main.jsx` — mounts the app.
- `src/App.jsx` — main CRM shell, state, data loading, and feature orchestration.
- `src/constants.js` — shared blank lead/demo objects and demo status options.
- `src/components/AuthScreen.jsx` — sign in/sign up screen.
- `src/components/TeamSetup.jsx` — create/join team screen.
- `src/supabase.js` — Supabase client.
- `src/styles.css` — global styling.

## Recommended next cleanup

The next refactor should split `App.jsx` into feature folders:

- `components/layout/Sidebar.jsx`
- `features/leads/LeadForm.jsx`
- `features/pipeline/KanbanBoard.jsx`
- `features/demo/DemoManagerModal.jsx`
- `features/demo/BuildDemoModal.jsx`
- `features/activity/ActivityModal.jsx`
- `features/team/TeamManagementModal.jsx`
- `hooks/useLeads.js`
- `hooks/useTeam.js`

This version is intentionally a safe first-pass refactor to reduce the single giant entry file without changing app behavior.
