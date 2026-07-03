-- Demo Website Manager migration
-- Run after the roles/team migrations.

alter table public.demos
  add column if not exists live_url text,
  add column if not exists github_repo text,
  add column if not exists hosting_provider text default 'Netlify',
  add column if not exists demo_status text default 'Not Started',
  add column if not exists deploy_status text,
  add column if not exists feedback text,
  add column if not exists sent_at timestamptz,
  add column if not exists approved_at timestamptz,
  add column if not exists launched_at timestamptz,
  add column if not exists updated_at timestamptz default now();

create or replace function public.touch_demo_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists demos_touch_updated_at on public.demos;
create trigger demos_touch_updated_at
before update on public.demos
for each row
execute function public.touch_demo_updated_at();

alter table public.demos enable row level security;

revoke all on table public.demos from anon;
grant select, insert, update, delete on table public.demos to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Allow all demos" on public.demos;
drop policy if exists "Team members can manage demos" on public.demos;

create policy "Team members can manage demos"
on public.demos
for all
to authenticated
using (
  exists (
    select 1
    from public.leads l
    where l.id = demos.lead_id
    and public.is_team_member(l.team_id)
  )
)
with check (
  exists (
    select 1
    from public.leads l
    where l.id = demos.lead_id
    and public.is_team_member(l.team_id)
  )
);
