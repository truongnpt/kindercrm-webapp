/*
 * EPIC-013 Phase 3 — Stock count, transfer, expiry (INV-008/010/012)
 */

create type public.stock_count_status as enum ('draft', 'completed', 'cancelled');

create table public.stock_counts (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  title varchar(200) not null,
  count_date date not null default current_date,
  status public.stock_count_status not null default 'draft',
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stock_counts_set_updated_at
  before update on public.stock_counts
  for each row execute function public.set_updated_at();

create table public.stock_count_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  stock_count_id uuid not null references public.stock_counts (id) on delete cascade,
  product_id uuid not null references public.inventory_products (id) on delete restrict,
  expected_quantity numeric(12, 2) not null default 0,
  counted_quantity numeric(12, 2),
  created_at timestamptz not null default now(),
  constraint stock_count_items_unique unique (stock_count_id, product_id)
);

create index idx_stock_count_items_count on public.stock_count_items (stock_count_id);

alter table public.inventory_transactions
  add column if not exists transfer_to_product_id uuid references public.inventory_products (id) on delete set null;

alter table public.stock_counts enable row level security;
alter table public.stock_count_items enable row level security;

create policy stock_counts_school on public.stock_counts
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy stock_count_items_school on public.stock_count_items
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update, delete on public.stock_counts to authenticated, service_role;
grant select, insert, update, delete on public.stock_count_items to authenticated, service_role;
