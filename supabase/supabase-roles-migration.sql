-- Owner / Admin / Member roles migration for Website Agency CRM
-- Run after supabase-team-migration.sql and supabase-activity-notes-migration.sql.
-- Goal:
-- owner: manage team roles and remove members; full CRM access
-- admin: manage CRM data and invite members; cannot change roles/remove members
-- member: view/add/edit/log activity; destructive deletes are restricted

-- Never expose CRM tables to anonymous visitors.
revoke all on table public.teams from anon;
revoke all on table public.team_members from anon;
revoke all on table public.leads from anon;
revoke all on table public.lead_activities from anon;
revoke all on table public.clients from anon;
revoke all on table public.demos from anon;

-- Authenticated users still need Data API privileges; RLS decides what rows they can touch.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.teams to authenticated;
grant select, insert, update, delete on table public.team_members to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.lead_activities to authenticated;
grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.demos to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.clients enable row level security;
alter table public.demos enable row level security;

create or replace function public.my_team_role(check_team_id uuid, check_user_id uuid default auth.uid())
returns text
language sql
security definer
set search_path = public
stable
as $$
  select tm.role
  from public.team_members tm
  where tm.team_id = check_team_id
    and tm.user_id = check_user_id
  limit 1;
$$;

create or replace function public.is_team_admin(check_team_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.my_team_role(check_team_id, check_user_id) in ('owner','admin'), false);
$$;

create or replace function public.is_team_owner(check_team_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.my_team_role(check_team_id, check_user_id) = 'owner', false);
$$;

create or replace function public.update_team_member_role(member_team_id uuid, member_user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_team_owner(member_team_id, auth.uid()) then
    raise exception 'Only team owners can change member roles';
  end if;

  if new_role not in ('owner','admin','member') then
    raise exception 'Invalid role';
  end if;

  if member_user_id = auth.uid() then
    raise exception 'Owners cannot change their own role from the app';
  end if;

  update public.team_members
  set role = new_role
  where team_id = member_team_id
    and user_id = member_user_id;
end;
$$;

create or replace function public.remove_team_member(member_team_id uuid, member_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_team_owner(member_team_id, auth.uid()) then
    raise exception 'Only team owners can remove members';
  end if;

  if member_user_id = auth.uid() then
    raise exception 'Owners cannot remove themselves from the app';
  end if;

  delete from public.team_members
  where team_id = member_team_id
    and user_id = member_user_id;
end;
$$;

grant execute on function public.my_team_role(uuid, uuid) to authenticated;
grant execute on function public.is_team_admin(uuid, uuid) to authenticated;
grant execute on function public.is_team_owner(uuid, uuid) to authenticated;
grant execute on function public.update_team_member_role(uuid, uuid, text) to authenticated;
grant execute on function public.remove_team_member(uuid, uuid) to authenticated;

-- Team members: direct writes are intentionally blocked. Creation/joining and role changes happen through RPC functions.
drop policy if exists "Users can insert themselves through functions" on public.team_members;
drop policy if exists "Owners/admins can manage team members" on public.team_members;
drop policy if exists "Team owners can update team members" on public.team_members;
drop policy if exists "Team owners can delete team members" on public.team_members;

-- Keep or recreate read policy.
drop policy if exists "Members can read team members" on public.team_members;
create policy "Members can read team members"
on public.team_members
for select
to authenticated
using (public.is_team_member(team_id));

-- Leads: members can view/add/edit; only owner/admin can delete.
drop policy if exists "Team members can delete leads" on public.leads;
drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
on public.leads
for delete
to authenticated
using (public.is_team_admin(team_id));

-- Activity notes: members can view/add/edit; users can delete their own notes, owner/admin can delete any team note.
drop policy if exists "Team members can delete activities" on public.lead_activities;
drop policy if exists "Admins or owners can delete activities" on public.lead_activities;
create policy "Admins or owners can delete activities"
on public.lead_activities
for delete
to authenticated
using (public.is_team_admin(team_id) or user_id = auth.uid());

-- Clients and demos: secure through the linked lead. Members can manage records tied to their team's leads.
drop policy if exists "Allow all clients" on public.clients;
drop policy if exists "Allow all demos" on public.demos;
drop policy if exists "Team members can manage clients" on public.clients;
drop policy if exists "Team members can manage demos" on public.demos;

create policy "Team members can manage clients"
on public.clients
for all
to authenticated
using (
  exists (
    select 1 from public.leads l
    where l.id = clients.lead_id
      and public.is_team_member(l.team_id)
  )
)
with check (
  exists (
    select 1 from public.leads l
    where l.id = clients.lead_id
      and public.is_team_member(l.team_id)
  )
);

create policy "Team members can manage demos"
on public.demos
for all
to authenticated
using (
  exists (
    select 1 from public.leads l
    where l.id = demos.lead_id
      and public.is_team_member(l.team_id)
  )
)
with check (
  exists (
    select 1 from public.leads l
    where l.id = demos.lead_id
      and public.is_team_member(l.team_id)
  )
);
