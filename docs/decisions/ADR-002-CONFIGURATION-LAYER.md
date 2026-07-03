# ADR-002: Configuration Layer

## Status
Accepted

## Context
Navigation items, feature flags, and brand metadata were starting to become hardcoded inside UI components.

## Decision
Create `src/config/` for navigation, routes, theme metadata, and feature flags.

## Consequences
- Sidebar and future route-aware components should read from config.
- New modules can be added by updating configuration instead of scattering labels throughout the UI.
