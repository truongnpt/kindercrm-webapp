/*
 * Atomic school onboarding — bypasses SELECT RLS on INSERT RETURNING
 * (member row must exist before get_auth_user_school_ids() includes the school).
 */

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

  insert into public.schools (name, slug, phone, email, address)
  values (p_name, p_slug, p_phone, p_email, p_address)
  returning id into v_school_id;

  insert into public.school_members (school_id, user_id, role)
  values (v_school_id, v_user_id, 'owner');

  insert into public.campuses (school_id, name, is_main, campus_type)
  values (v_school_id, p_campus_name, true, 'campus');

  select p.id
  into v_package_id
  from public.packages p
  where p.code = 'free'
  limit 1;

  if v_package_id is not null then
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
  end if;

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

revoke all on function public.create_school_for_owner(text, text, text, text, text, text)
  from public;

grant execute on function public.create_school_for_owner(text, text, text, text, text, text)
  to authenticated, service_role;
