/*
 * EPIC-014 — Health Management (Sức khỏe)
 */

create type public.health_incident_severity as enum ('minor', 'moderate', 'serious');

create type public.health_incident_type as enum (
  'injury',
  'illness',
  'allergy_reaction',
  'fall',
  'other'
);

create table public.health_growth_records (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  record_date date not null,
  height_cm numeric(5, 1),
  weight_kg numeric(5, 2),
  bmi numeric(5, 2),
  notes text,
  recorded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_health_growth_student on public.health_growth_records (student_id, record_date desc);

create table public.health_vaccinations (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  vaccine_name varchar(200) not null,
  dose_number int not null default 1,
  administered_on date not null,
  next_due_on date,
  provider varchar(200),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_health_vaccinations_student on public.health_vaccinations (student_id, administered_on desc);

create table public.health_medical_checkups (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  checkup_date date not null,
  checkup_type varchar(100) not null default 'periodic',
  height_cm numeric(5, 1),
  weight_kg numeric(5, 2),
  vision_result varchar(100),
  hearing_result varchar(100),
  dental_result varchar(100),
  doctor_name varchar(200),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_health_checkups_student on public.health_medical_checkups (student_id, checkup_date desc);

create table public.health_medications (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  name varchar(200) not null,
  dosage varchar(100),
  frequency varchar(100),
  start_date date not null,
  end_date date,
  instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger health_medications_set_updated_at
  before update on public.health_medications
  for each row execute function public.set_updated_at();

create table public.health_incidents (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  incident_date date not null default current_date,
  incident_time time,
  incident_type public.health_incident_type not null default 'other',
  severity public.health_incident_severity not null default 'minor',
  description text not null,
  treatment text,
  parent_notified_at timestamptz,
  reported_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_health_incidents_student on public.health_incidents (student_id, incident_date desc);

alter table public.health_growth_records enable row level security;
alter table public.health_vaccinations enable row level security;
alter table public.health_medical_checkups enable row level security;
alter table public.health_medications enable row level security;
alter table public.health_incidents enable row level security;

create policy health_growth_records_school on public.health_growth_records
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy health_growth_records_parent on public.health_growth_records
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy health_vaccinations_school on public.health_vaccinations
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy health_vaccinations_parent on public.health_vaccinations
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy health_medical_checkups_school on public.health_medical_checkups
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy health_medical_checkups_parent on public.health_medical_checkups
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy health_medications_school on public.health_medications
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy health_medications_parent on public.health_medications
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

create policy health_incidents_school on public.health_incidents
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy health_incidents_parent on public.health_incidents
  for select to authenticated
  using (student_id in (select public.get_auth_user_parent_student_ids()));

grant select, insert, update, delete on public.health_growth_records to authenticated, service_role;
grant select, insert, update, delete on public.health_vaccinations to authenticated, service_role;
grant select, insert, update, delete on public.health_medical_checkups to authenticated, service_role;
grant select, insert, update, delete on public.health_medications to authenticated, service_role;
grant select, insert, update, delete on public.health_incidents to authenticated, service_role;
