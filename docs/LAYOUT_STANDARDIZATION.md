# Sprint 1.5 — Layout Standardization

This update introduces a reusable app/page layout system so all current and future modules follow the same visual structure.

## Added layout components

- `src/layout/AppLayout.jsx`
- `src/layout/Topbar.jsx`
- `src/layout/PageLayout.jsx`
- `src/layout/Breadcrumbs.jsx`
- `src/layout/index.js`

## Standard page structure

Pages can now follow this pattern:

```jsx
<PageLayout>
  <PageHeader />
  <PageToolbar />
  <PageStats />
  <PageContent />
</PageLayout>
```

## Updated pages

- Dashboard now uses `PageLayout`, `PageStats`, and `PageContent`.
- Prospects now uses `PageLayout`, `PageToolbar`, `PageStats`, and `PageContent`.
- Pipeline now uses the standardized page layout while keeping drag-and-drop and table mode.
- Demo Websites now uses the standardized page layout.

## App shell changes

`App.jsx` now uses:

- `AppLayout`
- `Sidebar`
- `Topbar`
- `TeamBar`

This keeps global layout concerns separate from feature rendering.

## Styling

The layout system adds standardized spacing, topbar styling, content wrappers, responsive behavior, and page metadata pills in `src/styles.css`.

## Build status

`npm run build` passes.
