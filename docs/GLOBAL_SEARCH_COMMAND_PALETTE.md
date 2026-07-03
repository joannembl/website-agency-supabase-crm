# Phase 5 — Global Search & Command Palette

This phase turns the disabled topbar search into a working global search and command palette.

## What changed

- The topbar search is now clickable.
- `Cmd+K` / `Ctrl+K` opens the command palette.
- Search covers:
  - Navigation pages
  - Quick actions
  - Prospects
  - Prospect actions
  - Tasks
  - Recent notifications
- Results are grouped by type.
- Keyboard navigation is supported:
  - Up/down arrows move through results
  - Enter opens the selected result
  - Esc closes the modal through the shared Modal behavior

## Notes

This is Phase 1 of the command palette. It is intentionally frontend-only and does not need a Supabase migration.

Later enhancements can add:

- Full-text Supabase search
- Saved recent searches
- Natural-language commands
- AI actions such as “show prospects due today” or “generate proposal for Cafe Mollie”
- Deep-linked prospect workspace pages after Sprint 3
