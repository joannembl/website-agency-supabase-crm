-- Sprint 2 Phase 3: Task Management
-- Creates team-scoped tasks with RLS.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','completed','archived')),
  priority text not null default 'Medium' check (priority in ('High','Medium','Low')),
  task_type text not null default 'General',
  due_date date,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_team_id_idx on public.tasks(team_id);
create index if not exists tasks_lead_id_idx on public.tasks(lead_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_status_idx on public.tasks(status);

alter table public.tasks enable row level security;

revoke all on table public.tasks from anon;
grant select, insert, update, delete on table public.tasks to authenticated;

drop policy if exists "Team members can manage tasks" on public.tasks;

create policy "Team members can manage tasks"
on public.tasks
for all
to authenticated
using (is_team_member(team_id))
with check (is_team_member(team_id));
