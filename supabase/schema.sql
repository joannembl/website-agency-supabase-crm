-- Website Agency CRM Supabase schema
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  business_name text not null,
  instagram_handle text,
  category text,
  city text default 'Phoenix',
  followers integer,
  website_status text default 'Needs verification',
  website_url text,
  email text,
  phone text,
  google_rating numeric,
  google_reviews integer,
  priority text default 'B',
  status text default 'Research',
  notes text
);

create table if not exists demos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  demo_url text,
  built boolean default false,
  preview_note text
);

create table if not exists outreach (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  channel text,
  message text,
  outcome text,
  follow_up_date date
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete set null,
  monthly_fee numeric default 99,
  setup_fee numeric default 99,
  plan text default 'Website, Handled',
  active boolean default true
);

alter table leads enable row level security;
alter table demos enable row level security;
alter table outreach enable row level security;
alter table clients enable row level security;

-- For solo use during setup. Replace with authenticated policies later.
create policy "Allow all leads" on leads for all using (true) with check (true);
create policy "Allow all demos" on demos for all using (true) with check (true);
create policy "Allow all outreach" on outreach for all using (true) with check (true);
create policy "Allow all clients" on clients for all using (true) with check (true);
