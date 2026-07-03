# Sprint 1 — Prospects Page Redesign

This update applies the new shared design system to the Prospects module.

## Added

- CRM-style Prospects landing page
- Page header with quick metrics and actions
- Reusable StatCard metrics
- Search/filter toolbar using design system components
- Responsive prospect card grid
- Prospect cards with:
  - business identity/avatar
  - category/city
  - priority badge
  - pipeline status badge
  - demo status badge
  - website status badge
  - Instagram/phone/email/reviews
  - notes preview
  - inline pipeline stage selector
  - quick actions for Demo, Build, Activity, Edit, Delete
- Empty state for filtered results

## Notes

- Pipeline and Demo Websites are still using their existing board/table views. They are next in Sprint 1.
- No new Supabase migrations are required.
- Build verified with `npm run build`.
