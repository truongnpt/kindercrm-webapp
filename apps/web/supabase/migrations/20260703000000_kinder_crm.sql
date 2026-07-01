/*
 * EPIC-003 — CRM Enrollment (core)
 */

create type public.lead_stage as enum (
  'new',
  'contacted',
  'appointment',
  'visited',
  'deposit',
  'enrolled',
  'lost'
);

create type public.lead_status as enum ('active', 'won', 'lost');

create type public.lead_activity_type as enum (
  'created',
  'stage_changed',
  'assigned',
  'note',
  'contact',
  'appointment',
  'visit',
  'deposit',
  'enrollment'
);

-- CRM-007 Lead Source
create table public.lead_sources (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(100) not null,
  code varchar(50) not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_sources_school_code_unique unique (school_id, code)
);

create index idx_lead_sources_school on public.lead_sources (school_id);

-- CRM-001..006 Leads & pipeline
create table public.leads (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  campus_id uuid references public.campuses (id) on delete set null,
  source_id uuid references public.lead_sources (id) on delete set null,
  stage public.lead_stage not null default 'new',
  status public.lead_status not null default 'active',
  parent_name varchar(255) not null,
  phone varchar(50) not null,
  email varchar(320),
  child_name varchar(255),
  child_dob date,
  notes text,
  assigned_to uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_leads_school_stage on public.leads (school_id, stage)
  where deleted_at is null;

create index idx_leads_school_assigned on public.leads (school_id, assigned_to)
  where deleted_at is null;

-- CRM-019 Notes
create table public.lead_notes (
  id uuid primary key default extensions.uuid_generate_v4(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  body text not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_lead_notes_lead on public.lead_notes (lead_id, created_at desc);

-- CRM-008 / CRM-018 Activity timeline
create table public.lead_activities (
  id uuid primary key default extensions.uuid_generate_v4(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  activity_type public.lead_activity_type not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_lead_activities_lead on public.lead_activities (lead_id, created_at desc);

create trigger lead_sources_set_updated_at
  before update on public.lead_sources
  for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- RLS
alter table public.lead_sources enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_activities enable row level security;

create policy lead_sources_select on public.lead_sources
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy lead_sources_insert on public.lead_sources
  for insert to authenticated
  with check (
    public.user_has_school_role(school_id, array['owner', 'admin', 'staff']::public.school_member_role[])
  );

create policy lead_sources_update on public.lead_sources
  for update to authenticated
  using (
    public.user_has_school_role(school_id, array['owner', 'admin']::public.school_member_role[])
  );

create policy leads_select on public.leads
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy leads_insert on public.leads
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy leads_update on public.leads
  for update to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy lead_notes_select on public.lead_notes
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy lead_notes_insert on public.lead_notes
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy lead_activities_select on public.lead_activities
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy lead_activities_insert on public.lead_activities
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update on public.lead_sources to authenticated, service_role;
grant select, insert, update on public.leads to authenticated, service_role;
grant select, insert on public.lead_notes to authenticated, service_role;
grant select, insert on public.lead_activities to authenticated, service_role;
