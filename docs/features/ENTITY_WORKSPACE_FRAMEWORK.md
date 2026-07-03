# Sprint 3.1 — Entity Workspace Framework

This refactor adds a reusable workspace shell that future modules can share.

## Added

`src/features/workspace/`

- `EntityWorkspace.jsx` — generic workspace container
- `WorkspaceHeader.jsx` — reusable entity header
- `WorkspaceTabs.jsx` — reusable tab navigation
- `WorkspaceSidebar.jsx` — reusable right-side metadata panel
- `WorkspaceContent.jsx` — shared main/sidebar grid
- `WorkspaceTimeline.jsx` — shared activity timeline renderer
- `WorkspaceActions.jsx` — shared actions wrapper
- `WorkspaceContext.jsx` — workspace context + `useWorkspace`
- `index.js` — public exports

## Updated

- `ProspectWorkspace.jsx` now uses `EntityWorkspace` instead of owning the full layout itself.
- Prospect tabs are now passed as configuration objects with `id`, `label`, and `render`.
- Sidebar sections are now declarative and reusable.

## Why

The Prospect Workspace is now the first implementation of a broader pattern. Future modules can reuse this shell:

- Client Workspace
- Demo Website Workspace
- Task Workspace
- Proposal Workspace
- Website Inventory Workspace

## Example

```jsx
<EntityWorkspace
  entity={client}
  entityType="client"
  title={client.name}
  subtitle="Active client"
  tabs={tabs}
  sidebar={sidebar}
/>
```

This keeps future features visually consistent and reduces duplicated page layout code.
