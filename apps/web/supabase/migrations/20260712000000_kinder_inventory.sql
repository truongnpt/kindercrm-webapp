/*
 * EPIC-013 — Inventory Management (Kho)
 */

create type public.inventory_transaction_type as enum (
  'receipt',
  'issue',
  'adjustment',
  'transfer'
);

create table public.inventory_categories (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(150) not null,
  parent_id uuid references public.inventory_categories (id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.inventory_suppliers (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(200) not null,
  contact_name varchar(150),
  phone varchar(50),
  email varchar(255),
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger inventory_suppliers_set_updated_at
  before update on public.inventory_suppliers
  for each row execute function public.set_updated_at();

create table public.inventory_products (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  category_id uuid references public.inventory_categories (id) on delete set null,
  supplier_id uuid references public.inventory_suppliers (id) on delete set null,
  sku varchar(80),
  name varchar(200) not null,
  unit varchar(50) not null default 'cái',
  min_quantity numeric(12, 2) not null default 0,
  track_expiry boolean not null default false,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_products_school_sku_unique unique (school_id, sku)
);

create trigger inventory_products_set_updated_at
  before update on public.inventory_products
  for each row execute function public.set_updated_at();

create table public.inventory_stock (
  school_id uuid not null references public.schools (id) on delete cascade,
  product_id uuid not null references public.inventory_products (id) on delete cascade,
  quantity numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (school_id, product_id)
);

create table public.inventory_transactions (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  product_id uuid not null references public.inventory_products (id) on delete cascade,
  transaction_type public.inventory_transaction_type not null,
  quantity numeric(12, 2) not null,
  unit_cost numeric(14, 2),
  transaction_date date not null default current_date,
  expiry_date date,
  reference_number varchar(100),
  supplier_id uuid references public.inventory_suppliers (id) on delete set null,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_inventory_transactions_product on public.inventory_transactions (product_id, transaction_date desc);

create or replace function public.apply_inventory_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  delta numeric(12, 2);
begin
  if tg_op = 'INSERT' then
    delta := case
      when new.transaction_type in ('receipt', 'adjustment') then new.quantity
      when new.transaction_type = 'issue' then -abs(new.quantity)
      else new.quantity
    end;

    insert into public.inventory_stock (school_id, product_id, quantity, updated_at)
    values (new.school_id, new.product_id, delta, now())
    on conflict (school_id, product_id)
    do update set
      quantity = public.inventory_stock.quantity + excluded.quantity,
      updated_at = now();
  end if;

  return new;
end;
$$;

create trigger inventory_transactions_apply_stock
  after insert on public.inventory_transactions
  for each row execute function public.apply_inventory_transaction();

alter table public.inventory_categories enable row level security;
alter table public.inventory_suppliers enable row level security;
alter table public.inventory_products enable row level security;
alter table public.inventory_stock enable row level security;
alter table public.inventory_transactions enable row level security;

create policy inventory_categories_school on public.inventory_categories
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy inventory_suppliers_school on public.inventory_suppliers
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy inventory_products_school on public.inventory_products
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy inventory_stock_school on public.inventory_stock
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy inventory_transactions_school on public.inventory_transactions
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update, delete on public.inventory_categories to authenticated, service_role;
grant select, insert, update, delete on public.inventory_suppliers to authenticated, service_role;
grant select, insert, update, delete on public.inventory_products to authenticated, service_role;
grant select, insert, update, delete on public.inventory_stock to authenticated, service_role;
grant select, insert, update, delete on public.inventory_transactions to authenticated, service_role;
