# Sprint 1.75 — SaaS Shell Cleanup

This update standardizes the app shell so every module feels like one cohesive SaaS product.

## Changed

- Removed the duplicate team bar from the main workspace.
- Simplified the topbar into a compact utility bar.
- Kept team switching, connection status, refresh, notifications, sign out, and user identity in the utility bar.
- Moved page identity responsibility to each page's `PageHeader`.
- Updated the Dashboard to use the full workspace width.
- Removed the fragmented Dashboard layout with competing cards.
- Added a cleaner pipeline snapshot and next-action panel.
- Added `saasPageFrame` so page content scrolls predictably inside the workspace.

## Why

The previous standardized layout still had multiple competing headers and floating cards. This pass establishes a single page-header pattern and a more modern SaaS shell before Sprint 2.
