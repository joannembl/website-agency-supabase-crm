-- Team/shared access migration for Website Agency CRM
-- Run this AFTER supabase-auth-migration.sql.
-- It changes leads from per-user ownership to team-based sharing.

create extension if not exists pgcrypto;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique(team_id, user_id)
);

alter table public.leads add column if not exists team_id uuid references public.teams(id) on delete cascade;
create index if not exists leads_team_id_idx on public.leads(team_id);
create index if not exists team_members_user_id_idx on public.team_members(user_id);
create index if not exists team_members_team_id_idx on public.team_members(team_id);

-- Permissions for authenticated users through the Data API.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.teams to authenticated;
grant select, insert, update, delete on table public.team_members to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.leads enable row level security;

-- Helper function: checks team membership without triggering recursive RLS.
create or replace function public.is_team_member(check_team_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = check_team_id
      and tm.user_id = check_user_id
  );
$$;

-- Create a team and automatically add creator as owner.
create or replace function public.create_team(team_name text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  new_team public.teams;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.teams (name, created_by)
  values (team_name, auth.uid())
  returning * into new_team;

  insert into public.team_members (team_id, user_id, role)
  values (new_team.id, auth.uid(), 'owner')
  on conflict (team_id, user_id) do nothing;

  return new_team;
end;
$$;

-- Join a team using its invite code.
create or replace function public.join_team_by_code(code text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  found_team public.teams;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into found_team
  from public.teams
  where upper(invite_code) = upper(trim(code));

  if found_team.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (found_team.id, auth.uid(), 'member')
  on conflict (team_id, user_id) do nothing;

  return found_team;
end;
$$;

grant execute on function public.is_team_member(uuid, uuid) to authenticated;
grant execute on function public.create_team(text) to authenticated;
grant execute on function public.join_team_by_code(text) to authenticated;

-- Remove old per-user policies.
drop policy if exists "Users can read their own leads" on public.leads;
drop policy if exists "Users can insert their own leads" on public.leads;
drop policy if exists "Users can update their own leads" on public.leads;
drop policy if exists "Users can delete their own leads" on public.leads;
drop policy if exists "Team members can read leads" on public.leads;
drop policy if exists "Team members can insert leads" on public.leads;
drop policy if exists "Team members can update leads" on public.leads;
drop policy if exists "Team members can delete leads" on public.leads;

-- Teams policies.
drop policy if exists "Members can read their teams" on public.teams;
drop policy if exists "Authenticated users can create teams" on public.teams;
drop policy if exists "Owners/admins can update teams" on public.teams;

create policy "Members can read their teams"
on public.teams
for select
to authenticated
using (public.is_team_member(id));

create policy "Authenticated users can create teams"
on public.teams
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Owners/admins can update teams"
on public.teams
for update
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = auth.uid()
      and tm.role in ('owner','admin')
  )
)
with check (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = auth.uid()
      and tm.role in ('owner','admin')
  )
);

-- Team member policies.
drop policy if exists "Members can read team members" on public.team_members;
drop policy if exists "Users can insert themselves through functions" on public.team_members;
drop policy if exists "Owners/admins can manage team members" on public.team_members;

create policy "Members can read team members"
on public.team_members
for select
to authenticated
using (public.is_team_member(team_id));

create policy "Users can insert themselves through functions"
on public.team_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Owners/admins can manage team members"
on public.team_members
for update
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner','admin')
  )
)
with check (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner','admin')
  )
);

-- Lead policies: everyone on a team can manage that team's leads.
create policy "Team members can read leads"
on public.leads
for select
to authenticated
using (public.is_team_member(team_id));

create policy "Team members can insert leads"
on public.leads
for insert
to authenticated
with check (public.is_team_member(team_id));

create policy "Team members can update leads"
on public.leads
for update
to authenticated
using (public.is_team_member(team_id))
with check (public.is_team_member(team_id));

create policy "Team members can delete leads"
on public.leads
for delete
to authenticated
using (public.is_team_member(team_id));

-- Optional migration for existing leads:
-- 1) Create a team in the app.
-- 2) Copy its team id from Supabase.
-- 3) Run: update public.leads set team_id = 'YOUR_TEAM_ID' where team_id is null;
