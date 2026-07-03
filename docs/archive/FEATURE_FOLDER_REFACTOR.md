# Feature Folder Refactor

This refactor splits the CRM UI out of the large `App.jsx` file and into feature-based folders.

## New structure

```txt
src/
  App.jsx                         # App state, data loading, Supabase actions, orchestration
  constants.js                    # Shared options and blank records
  supabase.js                     # Supabase client
  styles.css

  layout/
    Sidebar.jsx                   # Left navigation
    WorkspaceHeader.jsx           # Header, team switcher, refresh, sign out
    TeamBar.jsx                   # Active team strip and invite/manage actions

  features/
    dashboard/
      DashboardView.jsx           # Dashboard stats and command center

    modules/
      PlaceholderModule.jsx       # Placeholder pages for future modules

    leads/
      LeadBoard.jsx               # Kanban/table prospect board
      LeadFormModal.jsx           # Add prospect modal
      EditLeadModal.jsx           # Edit prospect modal

    team/
      TeamModal.jsx               # Team members and roles modal

    activities/
      ActivityModal.jsx           # Activity notes/timeline modal

    demos/
      BuildDemoModal.jsx          # Build Demo Website V2 modal
      DemoManagerModal.jsx        # Demo Website Manager modal
```

## What changed

- Moved layout UI into `src/layout`.
- Moved prospect UI into `src/features/leads`.
- Moved activity notes into `src/features/activities`.
- Moved demo manager/build demo UI into `src/features/demos`.
- Moved team management into `src/features/team`.
- Centralized dropdown values in `src/constants.js`.
- Kept Supabase calls and shared business logic in `App.jsx` for now.

## Recommended next cleanup

1. Move lead-related Supabase functions into `features/leads/leadService.js`.
2. Move demo-related helper functions into `features/demos/demoBuilder.js`.
3. Move activity Supabase functions into `features/activities/activityService.js`.
4. Create custom hooks:
   - `useAuthSession`
   - `useTeams`
   - `useLeads`
   - `useActivities`
   - `useDemos`
5. Add TypeScript types when ready.
```
