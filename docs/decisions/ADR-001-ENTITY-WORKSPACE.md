# ADR-001: Entity Workspace Framework

## Status
Accepted

## Context
Agency OS needs a consistent interaction model for prospects, clients, demos, tasks, and future entities.

## Decision
Use a reusable Entity Workspace shell with shared header, tabs, content, sidebar, actions, and timeline patterns.

## Consequences
- Prospect Workspace is the first implementation.
- Client Workspace and Demo Workspace can reuse the same shell.
- Future modules should avoid creating one-off detail page layouts.
