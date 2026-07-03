# TypeScript Prep

The codebase is still JavaScript, but `src/types/` now contains JSDoc typedef files for core entities:

- `Prospect`
- `DemoWebsite`
- `Task`
- `Notification`

These files are intentionally lightweight so the eventual JavaScript to TypeScript migration can happen incrementally.

Recommended migration order:

1. Rename shared services to `.ts`.
2. Add database generated types from Supabase.
3. Rename hooks to `.ts` / `.tsx`.
4. Rename UI components to `.tsx`.
5. Rename feature pages last.
