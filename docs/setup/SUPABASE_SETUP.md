# Supabase Setup

## Environment variables

Use the public anon/publishable key in the frontend:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Never expose the Supabase service role key in this app.

## SQL order

Run:

1. `supabase/schema.sql`
2. Files in `supabase/migrations/` in chronological feature order.

## Recommended production checks

Run these in Supabase SQL Editor to audit policies:

```sql
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

```sql
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
```

Target state:

- `anon`: no direct CRM table access except what is explicitly needed for auth/public flows.
- `authenticated`: access controlled by RLS.
- `leads`: visible only to members of the lead's team.
- `lead_activities`: visible only through team access to the parent lead.
- `demos` and `clients`: protected through linked lead/team access.
- `team_members`: owners/admins can manage roles according to app rules.

## Common issue

If you see this error:

```text
invalid input syntax for type uuid: "undefined"
```

A query or insert is passing `undefined` into a UUID field. Guard the query until `teamId` and `userId` are loaded, and use `null` for optional UUID fields.
