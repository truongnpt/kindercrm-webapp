/*
 * EPIC-019 Tuition Management + EPIC-027 Payment Settings
 */

-- Extend payment_method enum
alter type public.payment_method add value if not exists 'qr_banking';

-- Extend invoice_status enum
alter type public.invoice_status add value if not exists 'waiting_verification';

-- TUITION-001 Fee categories
create type public.tuition_fee_category as enum (
  'tuition',
  'meals',
  'bus',
  'uniform',
  'extracurricular',
  'club',
  'insurance',
  'other'
);

alter table public.tuition_fee_items
  add column if not exists category public.tuition_fee_category not null default 'tuition';

-- TUITION-002 Fee plans
create table public.tuition_fee_plans (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(255) not null,
  class_id uuid references public.classes (id) on delete set null,
  student_id uuid references public.students (id) on delete set null,
  academic_year varchar(9),
  effective_from date not null default current_date,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tuition_fee_plan_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  plan_id uuid not null references public.tuition_fee_plans (id) on delete cascade,
  tuition_fee_item_id uuid not null references public.tuition_fee_items (id) on delete restrict,
  amount_override integer check (amount_override is null or amount_override >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint tuition_fee_plan_items_unique unique (plan_id, tuition_fee_item_id)
);

-- PAYMENT-001 Payment methods config
create type public.school_payment_method_type as enum (
  'cash',
  'bank_transfer',
  'qr_banking'
);

create table public.school_payment_methods (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  method public.school_payment_method_type not null,
  is_enabled boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_payment_methods_unique unique (school_id, method)
);

-- PAYMENT-002 Bank accounts
create type public.payment_account_status as enum ('active', 'inactive');

create table public.payment_accounts (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  campus_id uuid references public.campuses (id) on delete set null,
  bank_name varchar(255) not null,
  bank_code varchar(20) not null,
  account_number varchar(50) not null,
  account_name varchar(255) not null,
  branch varchar(255),
  logo_url text,
  is_default boolean not null default false,
  status public.payment_account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payment_accounts_school on public.payment_accounts (school_id, status);

-- PAYMENT-005 Payment instructions
create table public.payment_instructions (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  title varchar(255) not null default 'Payment instructions',
  description text,
  image_url text,
  video_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_instructions_school_unique unique (school_id)
);

-- PAYMENT-009 Audit log
create type public.payment_audit_action as enum (
  'account_created',
  'account_updated',
  'account_deactivated',
  'account_default_changed',
  'method_enabled',
  'method_disabled',
  'method_default_changed',
  'instructions_updated'
);

create table public.payment_audit_logs (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  action public.payment_audit_action not null,
  entity_type varchar(50) not null,
  entity_id uuid,
  details jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_payment_audit_logs_school on public.payment_audit_logs (school_id, created_at desc);

-- PAYMENT-006 Invoice integration
alter table public.invoices
  add column if not exists payment_account_id uuid references public.payment_accounts (id) on delete set null,
  add column if not exists transfer_content varchar(50),
  add column if not exists qr_code_url text;

create unique index if not exists idx_invoices_transfer_content
  on public.invoices (school_id, transfer_content)
  where transfer_content is not null;

-- TUITION-005 / PAYMENT-008 Payment verification
create type public.invoice_payment_status as enum (
  'pending',
  'waiting_verification',
  'verified',
  'rejected'
);

alter table public.invoice_payments
  add column if not exists status public.invoice_payment_status not null default 'verified',
  add column if not exists proof_url text,
  add column if not exists verification_note text,
  add column if not exists verified_by uuid references auth.users (id) on delete set null,
  add column if not exists verified_at timestamptz,
  add column if not exists submitted_by uuid references auth.users (id) on delete set null;

-- Storage for payment proofs
insert into storage.buckets (id, name, public)
values ('payment_proofs', 'payment_proofs', false)
on conflict (id) do nothing;

-- Triggers
create trigger tuition_fee_plans_set_updated_at
  before update on public.tuition_fee_plans
  for each row execute function public.set_updated_at();

create trigger school_payment_methods_set_updated_at
  before update on public.school_payment_methods
  for each row execute function public.set_updated_at();

create trigger payment_accounts_set_updated_at
  before update on public.payment_accounts
  for each row execute function public.set_updated_at();

create trigger payment_instructions_set_updated_at
  before update on public.payment_instructions
  for each row execute function public.set_updated_at();

-- RLS
alter table public.tuition_fee_plans enable row level security;
alter table public.tuition_fee_plan_items enable row level security;
alter table public.school_payment_methods enable row level security;
alter table public.payment_accounts enable row level security;
alter table public.payment_instructions enable row level security;
alter table public.payment_audit_logs enable row level security;

create policy tuition_fee_plans_all on public.tuition_fee_plans
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy tuition_fee_plan_items_all on public.tuition_fee_plan_items
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy school_payment_methods_all on public.school_payment_methods
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy payment_accounts_all on public.payment_accounts
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy payment_instructions_all on public.payment_instructions
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy payment_audit_logs_select on public.payment_audit_logs
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy payment_audit_logs_insert on public.payment_audit_logs
  for insert to authenticated
  with check (school_id in (select public.get_auth_user_school_ids()));

-- Extend notification category for finance
alter type public.notification_category add value if not exists 'finance';

-- Parents can read payment accounts and instructions for their school
create policy payment_accounts_parent_select on public.payment_accounts
  for select to authenticated
  using (
    school_id in (
      select psl.school_id
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
    )
  );

create policy payment_instructions_parent_select on public.payment_instructions
  for select to authenticated
  using (
    school_id in (
      select psl.school_id
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
    )
  );

create policy school_payment_methods_parent_select on public.school_payment_methods
  for select to authenticated
  using (
    school_id in (
      select psl.school_id
      from public.parent_student_links psl
      where psl.user_id = auth.uid()
    )
  );

-- Storage policies for payment proofs
create policy payment_proofs_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment_proofs');

create policy payment_proofs_select on storage.objects
  for select to authenticated
  using (bucket_id = 'payment_proofs');
