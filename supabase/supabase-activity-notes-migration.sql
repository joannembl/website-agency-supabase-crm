create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  activity_type text not null default 'Note',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists lead_activities_lead_id_idx on public.lead_activities(lead_id);
create index if not exists lead_activities_team_id_idx on public.lead_activities(team_id);

alter table public.lead_activities enable row level security;

drop policy if exists "Team members can read activities" on public.lead_activities;
drop policy if exists "Team members can insert activities" on public.lead_activities;
drop policy if exists "Team members can update activities" on public.lead_activities;
drop policy if exists "Team members can delete activities" on public.lead_activities;

create policy "Team members can read activities"
on public.lead_activities
for select
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = lead_activities.team_id
    and tm.user_id = auth.uid()
  )
);

create policy "Team members can insert activities"
on public.lead_activities
for insert
to authenticated
with check (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = lead_activities.team_id
    and tm.user_id = auth.uid()
  )
);

create policy "Team members can update activities"
on public.lead_activities
for update
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = lead_activities.team_id
    and tm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = lead_activities.team_id
    and tm.user_id = auth.uid()
  )
);

create policy "Team members can delete activities"
on public.lead_activities
for delete
to authenticated
using (
  exists (
    select 1 from public.team_members tm
    where tm.team_id = lead_activities.team_id
    and tm.user_id = auth.uid()
  )
);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.lead_activities to authenticated;
grant usage, select on all sequences in schema public to authenticated;
