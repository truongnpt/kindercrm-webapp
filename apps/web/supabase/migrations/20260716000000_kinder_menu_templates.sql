/*
 * EPIC-012 Phase 3 — Menu templates & inventory link (MENU-014, MENU-015)
 */

alter table public.ingredients
  add column if not exists inventory_product_id uuid references public.inventory_products (id) on delete set null;

create table public.menu_templates (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(200) not null,
  description text,
  period_type public.menu_period_type not null default 'weekly',
  items jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menu_templates_set_updated_at
  before update on public.menu_templates
  for each row execute function public.set_updated_at();

alter table public.menu_templates enable row level security;

create policy menu_templates_school on public.menu_templates
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

grant select, insert, update, delete on public.menu_templates to authenticated, service_role;
