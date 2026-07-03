-- Run this after the original schema to require login and isolate leads per user.
-- It converts the CRM from public read/write access to authenticated access.

alter table public.leads add column if not exists owner_id uuid references auth.users(id) on delete cascade;
create index if not exists leads_owner_id_idx on public.leads(owner_id);

-- Keep API permissions available to logged-in users.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.leads to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Remove public/demo policies if they exist.
drop policy if exists "Allow all leads" on public.leads;
drop policy if exists "Allow public read leads" on public.leads;
drop policy if exists "Allow public insert leads" on public.leads;
drop policy if exists "Allow public update leads" on public.leads;
drop policy if exists "Allow public delete leads" on public.leads;
drop policy if exists "Public read" on public.leads;
drop policy if exists "Public insert" on public.leads;
drop policy if exists "Public update" on public.leads;
drop policy if exists "Public delete" on public.leads;
drop policy if exists "Users can read their own leads" on public.leads;
drop policy if exists "Users can insert their own leads" on public.leads;
drop policy if exists "Users can update their own leads" on public.leads;
drop policy if exists "Users can delete their own leads" on public.leads;

alter table public.leads enable row level security;

create policy "Users can read their own leads"
on public.leads
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can insert their own leads"
on public.leads
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update their own leads"
on public.leads
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete their own leads"
on public.leads
for delete
to authenticated
using (owner_id = auth.uid());
