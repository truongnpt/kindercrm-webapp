/*
 * EPIC-006 — Finance (core)
 */

create type public.tuition_billing_cycle as enum (
  'monthly',
  'quarterly',
  'semester',
  'yearly',
  'one_time'
);

create type public.invoice_status as enum (
  'draft',
  'issued',
  'partial',
  'paid',
  'overdue',
  'cancelled'
);

create type public.payment_method as enum (
  'cash',
  'bank_transfer',
  'card',
  'other'
);

create type public.invoice_adjustment_type as enum (
  'discount',
  'scholarship'
);

-- FIN-001 Tuition fee items
create table public.tuition_fee_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(255) not null,
  description text,
  amount integer not null check (amount >= 0),
  billing_cycle public.tuition_billing_cycle not null default 'monthly',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tuition_fee_items_school_name_unique unique (school_id, name)
);

-- FIN-002 Invoices
create table public.invoices (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete restrict,
  invoice_number varchar(50) not null,
  title varchar(255) not null,
  billing_period varchar(7) not null,
  issue_date date not null default current_date,
  due_date date not null,
  subtotal integer not null default 0,
  discount_amount integer not null default 0,
  total_amount integer not null default 0,
  paid_amount integer not null default 0,
  status public.invoice_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_school_number_unique unique (school_id, invoice_number)
);

create index idx_invoices_school_status on public.invoices (school_id, status);

create index idx_invoices_student on public.invoices (student_id);

create index idx_invoices_billing_period on public.invoices (school_id, billing_period);

create table public.invoice_line_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  tuition_fee_item_id uuid references public.tuition_fee_items (id) on delete set null,
  description varchar(255) not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount integer not null check (unit_amount >= 0),
  line_total integer not null check (line_total >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- FIN-005 Discount / FIN-006 Scholarship
create table public.invoice_adjustments (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  adjustment_type public.invoice_adjustment_type not null default 'discount',
  label varchar(255) not null,
  amount integer not null check (amount >= 0),
  created_at timestamptz not null default now()
);

-- FIN-003 Payment / FIN-008 Receipt / FIN-009 History
create table public.invoice_payments (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  amount integer not null check (amount > 0),
  payment_method public.payment_method not null default 'cash',
  paid_at timestamptz not null default now(),
  receipt_number varchar(50) not null,
  reference_note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint invoice_payments_school_receipt_unique unique (school_id, receipt_number)
);

create index idx_invoice_payments_invoice on public.invoice_payments (invoice_id);

create index idx_invoice_payments_paid_at on public.invoice_payments (school_id, paid_at);

-- FIN-007 Refund
create table public.payment_refunds (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  payment_id uuid not null references public.invoice_payments (id) on delete restrict,
  amount integer not null check (amount > 0),
  reason text,
  refunded_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create trigger tuition_fee_items_set_updated_at
  before update on public.tuition_fee_items
  for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- RLS
alter table public.tuition_fee_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.invoice_adjustments enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.payment_refunds enable row level security;

create policy tuition_fee_items_all on public.tuition_fee_items
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy invoices_all on public.invoices
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy invoice_line_items_all on public.invoice_line_items
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy invoice_adjustments_all on public.invoice_adjustments
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy invoice_payments_all on public.invoice_payments
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy payment_refunds_all on public.payment_refunds
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update on public.tuition_fee_items to authenticated, service_role;
grant select, insert, update on public.invoices to authenticated, service_role;
grant select, insert, update, delete on public.invoice_line_items to authenticated, service_role;
grant select, insert, update, delete on public.invoice_adjustments to authenticated, service_role;
grant select, insert on public.invoice_payments to authenticated, service_role;
grant select, insert on public.payment_refunds to authenticated, service_role;
