# Shared Design System

This sprint introduces the shared UI foundation for Crafted Digital OS.

## Added components

Located in `src/components/ui/`:

- `Button` — primary, secondary, ghost, danger, success variants; sm/md/lg sizes; optional icon.
- `Card` / `CardHeader` — consistent white panels, padding, shadows, section headers.
- `PageHeader` — standard page title, description, meta badges, and action area.
- `Badge` / `statusTone` — reusable status badges for pipeline, demo, activity, and role labels.
- `StatCard` — dashboard/prospect metric cards.
- `Toolbar` / `ToolbarGroup` — consistent page action bars.
- `SearchInput` — standard search field with icon.
- `FilterSelect` — labeled filter dropdown.
- `EmptyState` — consistent empty-state panels.
- `Modal` — standard modal shell with header/body/footer.
- `Tabs` — reusable tab switcher.

## Added styles

- `src/design-system.css`
- Imported globally in `src/main.jsx`

## First integration pass

The design system is wired into:

- `WorkspaceHeader`
- `DashboardView`

The next Sprint 1 steps should reuse these components in:

1. Prospects page
2. Pipeline page
3. Demo Websites page

## Design principles

- Use shared components before creating custom one-off UI.
- Keep feature logic inside `features/*`.
- Keep generic UI inside `components/ui/*`.
- Prefer badges and cards for scanability.
- Keep modals consistent with sticky footer actions.

## Recommended next cleanup

Replace older classes gradually:

- `.card` → `<Card />`
- `.toolbar` → `<Toolbar />`
- `.search` → `<SearchInput />`
- `.secondaryBtn` / `.addLeadBtn` → `<Button />`
- old status text → `<Badge />`
