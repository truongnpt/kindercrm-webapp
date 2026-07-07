/*
 * Seed subscription packages for production (seed.sql only runs locally).
 * Backfill trial subscriptions for schools created without a package row.
 */

insert into public.packages (
  code,
  name,
  description,
  max_students,
  max_campuses,
  max_storage_mb,
  ai_credits_monthly,
  features,
  price_monthly,
  is_active,
  sort_order
)
values
  (
    'free',
    'Free',
    'Dùng thử 14 ngày — trải nghiệm đầy đủ mọi tính năng',
    50,
    1,
    512,
    0,
    '{"crm": true, "students": true, "finance_basic": true}'::jsonb,
    0,
    true,
    0
  ),
  (
    'starter',
    'Starter',
    'Cho trường mầm non đang phát triển',
    150,
    3,
    2048,
    100,
    '{"crm": true, "students": true, "classes": true, "finance": true, "attendance": true, "staff": true, "parent_portal": true, "daily_reports": true, "meal_menu": true}'::jsonb,
    990000,
    true,
    1
  ),
  (
    'pro',
    'Pro',
    'Đa cơ sở, đầy đủ phân hệ Phase 1',
    500,
    10,
    10240,
    500,
    '{"crm": true, "students": true, "classes": true, "finance": true, "attendance": true, "staff": true, "reports": true, "parent_portal": true, "daily_reports": true, "meal_menu": true, "inventory": true, "health_management": true, "calendar": true, "ai_assistant": true}'::jsonb,
    2490000,
    true,
    2
  ),
  (
    'enterprise',
    'Enterprise',
    'Hệ thống nhiều chi nhánh, không giới hạn cơ bản',
    999999,
    999,
    102400,
    5000,
    '{"all": true}'::jsonb,
    0,
    true,
    3
  )
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  max_students = excluded.max_students,
  max_campuses = excluded.max_campuses,
  max_storage_mb = excluded.max_storage_mb,
  ai_credits_monthly = excluded.ai_credits_monthly,
  features = excluded.features,
  price_monthly = excluded.price_monthly,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Backfill trial subscriptions for schools onboarded before packages existed.
with missing as (
  select
    s.id as school_id,
    p.id as package_id,
    now() + interval '14 days' as trial_ends
  from public.schools s
  cross join lateral (
    select id
    from public.packages
    where code = 'free'
    limit 1
  ) p
  where s.deleted_at is null
    and not exists (
      select 1
      from public.school_subscriptions ss
      where ss.school_id = s.id
    )
)
insert into public.school_subscriptions (
  school_id,
  package_id,
  status,
  trial_ends_at,
  current_period_start,
  current_period_end
)
select
  school_id,
  package_id,
  'trial',
  trial_ends,
  now(),
  trial_ends
from missing;

with missing_history as (
  select
    s.id as school_id,
    p.id as package_id
  from public.schools s
  cross join lateral (
    select id
    from public.packages
    where code = 'free'
    limit 1
  ) p
  where s.deleted_at is null
    and exists (
      select 1
      from public.school_subscriptions ss
      where ss.school_id = s.id
    )
    and not exists (
      select 1
      from public.school_subscription_history ssh
      where ssh.school_id = s.id
    )
)
insert into public.school_subscription_history (
  school_id,
  package_id,
  status,
  note
)
select
  school_id,
  package_id,
  'trial',
  'Backfilled initial trial subscription'
from missing_history;

-- Fail onboarding atomically when the free package row is missing.
create or replace function public.create_school_for_owner(
  p_name text,
  p_slug text,
  p_phone text default null,
  p_email text default null,
  p_address text default null,
  p_campus_name text default 'Cơ sở chính'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school_id uuid;
  v_user_id uuid := auth.uid();
  v_package_id uuid;
  v_trial_ends timestamptz;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1
    from public.schools s
    where s.slug = p_slug
      and s.deleted_at is null
  ) then
    raise exception 'SCHOOL_SLUG_TAKEN' using errcode = 'P0001';
  end if;

  select p.id
  into v_package_id
  from public.packages p
  where p.code = 'free'
  limit 1;

  if v_package_id is null then
    raise exception 'PACKAGE_NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into public.schools (name, slug, phone, email, address)
  values (p_name, p_slug, p_phone, p_email, p_address)
  returning id into v_school_id;

  insert into public.school_members (school_id, user_id, role)
  values (v_school_id, v_user_id, 'owner');

  insert into public.campuses (school_id, name, is_main, campus_type)
  values (v_school_id, p_campus_name, true, 'campus');

  perform public.seed_school_role_permissions(v_school_id);

  v_trial_ends := now() + interval '14 days';

  insert into public.school_subscriptions (
    school_id,
    package_id,
    status,
    trial_ends_at,
    current_period_start,
    current_period_end
  )
  values (
    v_school_id,
    v_package_id,
    'trial',
    v_trial_ends,
    now(),
    v_trial_ends
  );

  insert into public.school_subscription_history (
    school_id,
    package_id,
    status,
    changed_by,
    note
  )
  values (
    v_school_id,
    v_package_id,
    'trial',
    v_user_id,
    'Initial trial subscription'
  );

  insert into public.lead_sources (school_id, code, name, sort_order, is_active)
  values
    (v_school_id, 'facebook', 'Facebook', 0, true),
    (v_school_id, 'website', 'Website', 1, true),
    (v_school_id, 'walk_in', 'Đến trực tiếp', 2, true),
    (v_school_id, 'referral', 'Giới thiệu', 3, true),
    (v_school_id, 'hotline', 'Hotline', 4, true)
  on conflict (school_id, code) do nothing;

  return v_school_id;
end;
$$;
