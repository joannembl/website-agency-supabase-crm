-- Phase 4: Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  message text,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_team_created_idx on public.notifications(team_id, created_at desc);
create index if not exists notifications_user_read_idx on public.notifications(user_id, is_read);

alter table public.notifications enable row level security;

revoke all on table public.notifications from anon;
grant select, insert, update, delete on table public.notifications to authenticated;

drop policy if exists "Team members can read notifications" on public.notifications;
drop policy if exists "Team members can create notifications" on public.notifications;
drop policy if exists "Users can update their notifications" on public.notifications;
drop policy if exists "Admins can delete notifications" on public.notifications;

create policy "Team members can read notifications"
on public.notifications
for select
to authenticated
using (
  public.is_team_member(team_id)
  and (user_id is null or user_id = auth.uid())
);

create policy "Team members can create notifications"
on public.notifications
for insert
to authenticated
with check (
  public.is_team_member(team_id)
  and (user_id is null or user_id = auth.uid())
);

create policy "Users can update their notifications"
on public.notifications
for update
to authenticated
using (
  public.is_team_member(team_id)
  and (user_id is null or user_id = auth.uid())
)
with check (
  public.is_team_member(team_id)
  and (user_id is null or user_id = auth.uid())
);

create policy "Admins can delete notifications"
on public.notifications
for delete
to authenticated
using (
  exists (
    select 1
    from public.team_members tm
    where tm.team_id = notifications.team_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner','admin')
  )
);
