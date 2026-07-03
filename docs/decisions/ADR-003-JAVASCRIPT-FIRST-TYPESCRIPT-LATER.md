# ADR-003: JavaScript First, TypeScript Later

## Status
Accepted

## Context
The app is moving quickly and is still in MVP development. A full TypeScript migration would slow feature delivery right now.

## Decision
Stay in JavaScript for the moment, but prepare the codebase with JSDoc typedefs, constants, feature barrels, and service boundaries.

## Consequences
- Future TypeScript migration will be incremental.
- New service and hook code should be written with clear data shapes and minimal implicit object mutation.
