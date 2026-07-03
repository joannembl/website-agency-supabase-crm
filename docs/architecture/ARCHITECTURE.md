# Architecture

## Stack

- React
- Vite
- Supabase Auth + Postgres + RLS
- Feature-folder architecture
- Shared UI design system

## App structure

```text
src/
├── components/
│   └── ui/                 # reusable UI primitives
├── features/
│   ├── activities/         # activity notes + activity service
│   ├── command/            # global search / command palette
│   ├── dashboard/          # dashboard widgets
│   ├── demos/              # demo manager + build demo helpers
│   ├── leads/              # prospects, lead forms, board, service
│   ├── notifications/      # notification drawer + service
│   ├── tasks/              # tasks page, task modal, service
│   ├── team/               # team management
│   └── workspace/          # reusable entity workspace framework
├── hooks/                  # app-level data hooks
├── layout/                 # SaaS shell layout components
├── constants.js
├── supabase.js
└── styles.css
```

## Conventions

- UI components should not call Supabase directly.
- Supabase calls belong in feature service files.
- Cross-feature state should flow through hooks or the workspace context.
- New entity detail experiences should use the Entity Workspace Framework.
- Prefer shared `components/ui` primitives before creating custom local UI.

## Entity Workspace Framework

Use the generic workspace shell for entity-specific pages:

- `EntityWorkspace`
- `WorkspaceHeader`
- `WorkspaceTabs`
- `WorkspaceSidebar`
- `WorkspaceContent`
- `WorkspaceTimeline`
- `WorkspaceActions`
- `WorkspaceContext`

Prospect Workspace is the first implementation. Future Client, Demo, Task, and Website Inventory workspaces should reuse this pattern.
