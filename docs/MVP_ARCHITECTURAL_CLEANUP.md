# MVP Architectural Cleanup

This cleanup pass prepares Agency OS for continued MVP development after the Entity Workspace Framework.

## Implemented

### App shell

- Added `src/app/AppProviders.jsx`.
- Added `src/app/ErrorBoundary.jsx`.
- Wrapped the root app in the provider shell from `src/main.jsx`.

### Configuration layer

- Added `src/config/navigation.js`.
- Added `src/config/routes.js`.
- Added `src/config/theme.js`.
- Added `src/config/features.js`.
- Updated the sidebar to consume centralized navigation and theme metadata.

### Constants layer

- Split shared constants into dedicated modules under `src/constants/`:
  - pipeline stages
  - demo statuses
  - roles
  - priorities
  - notification types
  - lead options
  - default record shapes
- Kept `src/constants.js` as a backwards-compatible compatibility layer.

### Feature barrels

- Added `index.js` files for feature folders so imports can use feature-level public APIs.
- Updated top-level imports in `App.jsx` to use barrels where practical.

### Hook barrels

- Added `src/hooks/index.js` for cleaner hook imports.

### TypeScript migration prep

- Added lightweight JSDoc typedef files in `src/types/` for:
  - Prospect
  - DemoWebsite
  - Task
  - Notification

### Documentation

- Added architecture docs for configuration and constants.
- Added developer docs for barrel exports and TypeScript migration prep.
- Added ADRs for Entity Workspace, configuration layer, and JavaScript-first TypeScript-later strategy.

## Verification

The project build was verified with `npm run build` in this environment. The repository remains configured for pnpm through `packageManager` and `.npmrc`.

## Next cleanup pass

Recommended next cleanup before major new feature work:

1. Continue replacing deep imports with feature barrels.
2. Move app state orchestration out of `App.jsx` into app-level hooks/context.
3. Add Supabase generated database types.
4. Begin incremental TypeScript migration with services and hooks first.
5. Add test scaffolding for service functions and key UI workflows.
