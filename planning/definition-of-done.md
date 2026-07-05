# Definition of Done

A task is complete only when:

- The feature builds successfully with `pnpm build`.
- The UI is responsive at desktop and mobile widths.
- Supabase migrations are included when schema changes are needed.
- RLS implications are reviewed for database changes.
- Empty, loading, and error states are considered.
- Documentation is updated if behavior, setup, or architecture changes.
- The feature uses existing design system components when possible.
- New logic is placed in the appropriate feature/service/hook folder.
- No service role keys or secrets are exposed in frontend code.
