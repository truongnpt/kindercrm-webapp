/*
 * EPIC-013 — Purchase orders (INV-005/006)
 */

create type public.purchase_order_status as enum (
  'draft',
  'submitted',
  'received',
  'cancelled'
);

create table public.purchase_orders (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  supplier_id uuid references public.inventory_suppliers (id) on delete set null,
  po_number varchar(80) not null,
  status public.purchase_order_status not null default 'draft',
  order_date date not null default current_date,
  expected_date date,
  notes text,
  total_amount numeric(14, 2) not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_school_po_unique unique (school_id, po_number)
);

create trigger purchase_orders_set_updated_at
  before update on public.purchase_orders
  for each row execute function public.set_updated_at();

create table public.purchase_order_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders (id) on delete cascade,
  product_id uuid not null references public.inventory_products (id) on delete restrict,
  quantity numeric(12, 2) not null,
  unit_cost numeric(14, 2) not null default 0,
  received_quantity numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index idx_purchase_order_items_po on public.purchase_order_items (purchase_order_id);

alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;

create policy purchase_orders_school on public.purchase_orders
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy purchase_order_items_school on public.purchase_order_items
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update, delete on public.purchase_orders to authenticated, service_role;
grant select, insert, update, delete on public.purchase_order_items to authenticated, service_role;
