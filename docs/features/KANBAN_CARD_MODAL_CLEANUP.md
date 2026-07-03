# Kanban Card Modal Cleanup

This update cleans up the Pipeline/Kanban cards by removing the crowded modal action icons from each prospect card.

## Changes

- Kanban cards now behave more like Jira cards.
- Clicking a prospect card opens a detail modal.
- The modal includes collapsible sections for:
  - Prospect details
  - Pipeline
  - Demo website
  - Build demo website
  - Activity notes
  - Edit / admin
- The card footer is simplified to Back / Next stage movement plus a small hint.
- Existing drag-and-drop behavior remains intact.
- Existing external modals are still reused from the new detail modal.

## Build

Build verified with:

```bash
npm run build
```
