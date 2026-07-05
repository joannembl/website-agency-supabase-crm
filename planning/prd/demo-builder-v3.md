# PRD: Build Demo Website V3

## Problem

Agency owners need a focused workflow that reduces manual work and keeps sales, fulfillment, and operations organized.

## Goals

- Make the workflow faster and easier to understand.
- Use existing Entity Workspace, service, hook, and design system patterns.
- Support team-based access and secure data handling.

## Non-goals

- Do not build custom backend services unless required.
- Do not bypass Supabase RLS for frontend functionality.
- Do not introduce a new UI pattern unless the design system cannot support it.

## User Stories

- As an agency owner, I want to complete this workflow from one page.
- As a team member, I want clear tasks and statuses.
- As a developer, I want the implementation to fit the current architecture.

## Acceptance Criteria

- Feature has responsive UI.
- Feature uses shared components.
- Feature handles loading, empty, and error states.
- Feature includes database migration if needed.
- Feature updates docs where applicable.

## Future Enhancements

- AI assistance
- Advanced analytics
- Automation hooks
