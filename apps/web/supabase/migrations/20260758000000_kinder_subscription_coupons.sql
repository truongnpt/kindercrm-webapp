/*
 * SUB-023 — Subscription coupons (percent off / free months)
 */

create table if not exists public.subscription_coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  discount_type text not null check (discount_type in ('percent_off', 'free_months')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  applicable_package_codes text[] not null default '{}',
  stripe_coupon_id text,
  stripe_promotion_code_id text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscription_coupons_code_key unique (code),
  constraint subscription_coupons_percent_range check (
    discount_type <> 'percent_off' or (discount_value > 0 and discount_value <= 100)
  ),
  constraint subscription_coupons_free_months_range check (
    discount_type <> 'free_months' or (discount_value >= 1 and discount_value <= 24)
  )
);

create table if not exists public.subscription_coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.subscription_coupons (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  constraint subscription_coupon_redemptions_coupon_school_key unique (coupon_id, school_id)
);

create index if not exists subscription_coupons_active_code_idx
  on public.subscription_coupons (code)
  where is_active = true;

create index if not exists subscription_coupon_redemptions_school_idx
  on public.subscription_coupon_redemptions (school_id, created_at desc);

comment on table public.subscription_coupons is
  'Platform-managed subscription discount codes (SUB-023).';

alter table public.subscription_coupons enable row level security;
alter table public.subscription_coupon_redemptions enable row level security;

create policy subscription_coupons_select_active on public.subscription_coupons
  for select to authenticated
  using (
    is_active = true
    and (expires_at is null or expires_at > now())
  );

create policy subscription_coupons_platform_admin_select on public.subscription_coupons
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

create policy subscription_coupons_platform_admin_insert on public.subscription_coupons
  for insert to authenticated
  with check (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

create policy subscription_coupons_platform_admin_update on public.subscription_coupons
  for update to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  )
  with check (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

create policy subscription_coupon_redemptions_select on public.subscription_coupon_redemptions
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

create policy subscription_coupon_redemptions_platform_admin_select
  on public.subscription_coupon_redemptions
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'billing']::public.platform_admin_role[]
    )
  );

grant select on public.subscription_coupons to authenticated, service_role;
grant insert, update on public.subscription_coupons to authenticated, service_role;
grant select, insert, update on public.subscription_coupon_redemptions to service_role;
grant select on public.subscription_coupon_redemptions to authenticated;
