-- Sprint 2 Phase 2: Follow-up Engine
-- Adds follow-up/reminder fields to prospects.

alter table public.leads
  add column if not exists next_follow_up_date date,
  add column if not exists follow_up_type text,
  add column if not exists follow_up_note text,
  add column if not exists last_contacted_at timestamptz;

create index if not exists leads_team_follow_up_idx
  on public.leads (team_id, next_follow_up_date)
  where next_follow_up_date is not null;

comment on column public.leads.next_follow_up_date is 'Next date this prospect should be contacted.';
comment on column public.leads.follow_up_type is 'DM, Call, Email, Meeting, Send Proposal, Review Demo, or Other.';
comment on column public.leads.follow_up_note is 'Short note explaining what to do during the next follow-up.';
comment on column public.leads.last_contacted_at is 'Timestamp for the most recent completed follow-up/contact.';
