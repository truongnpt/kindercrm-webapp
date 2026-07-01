/*
 * EPIC-012 — Meal & Menu Management (Thực đơn)
 */

create type public.menu_status as enum ('draft', 'published');
create type public.menu_period_type as enum ('daily', 'weekly', 'monthly');
create type public.meal_slot as enum ('breakfast', 'lunch', 'snack', 'dinner');

create table public.meal_categories (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(100) not null,
  code varchar(50) not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint meal_categories_school_code_unique unique (school_id, code)
);

create table public.ingredients (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name varchar(200) not null,
  unit varchar(50) not null default 'g',
  allergen_tags text[] not null default '{}',
  nutrition_info jsonb not null default '{}'::jsonb,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ingredients_set_updated_at
  before update on public.ingredients
  for each row execute function public.set_updated_at();

create table public.dishes (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  meal_category_id uuid references public.meal_categories (id) on delete set null,
  name varchar(200) not null,
  description text,
  ingredient_items jsonb not null default '[]'::jsonb,
  nutrition_info jsonb not null default '{}'::jsonb,
  allergen_tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger dishes_set_updated_at
  before update on public.dishes
  for each row execute function public.set_updated_at();

create table public.menus (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  title varchar(200) not null,
  period_type public.menu_period_type not null default 'weekly',
  start_date date not null,
  end_date date not null,
  status public.menu_status not null default 'draft',
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menus_set_updated_at
  before update on public.menus
  for each row execute function public.set_updated_at();

create table public.menu_items (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  menu_id uuid not null references public.menus (id) on delete cascade,
  menu_date date not null,
  meal_slot public.meal_slot not null,
  dish_id uuid references public.dishes (id) on delete set null,
  custom_dish_name varchar(200),
  portion_notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint menu_items_unique unique (menu_id, menu_date, meal_slot, sort_order)
);

create index idx_menu_items_menu_date on public.menu_items (menu_id, menu_date);

alter table public.meal_categories enable row level security;
alter table public.ingredients enable row level security;
alter table public.dishes enable row level security;
alter table public.menus enable row level security;
alter table public.menu_items enable row level security;

create policy meal_categories_school on public.meal_categories
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy ingredients_school on public.ingredients
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy dishes_school on public.dishes
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy menus_school on public.menus
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy menu_items_school on public.menu_items
  for all to authenticated
  using (school_id in (select public.get_auth_user_school_ids()))
  with check (school_id in (select public.get_auth_user_school_ids()));

create policy menus_parent_select on public.menus
  for select to authenticated
  using (
    status = 'published'
    and school_id in (
      select distinct school_id from public.parent_student_links
      where user_id = auth.uid()
    )
  );

create policy menu_items_parent_select on public.menu_items
  for select to authenticated
  using (
    school_id in (
      select distinct school_id from public.parent_student_links
      where user_id = auth.uid()
    )
    and menu_id in (
      select id from public.menus
      where status = 'published'
    )
  );

create policy dishes_parent_select on public.dishes
  for select to authenticated
  using (
    school_id in (
      select distinct school_id from public.parent_student_links
      where user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.meal_categories to authenticated, service_role;
grant select, insert, update, delete on public.ingredients to authenticated, service_role;
grant select, insert, update, delete on public.dishes to authenticated, service_role;
grant select, insert, update, delete on public.menus to authenticated, service_role;
grant select, insert, update, delete on public.menu_items to authenticated, service_role;
