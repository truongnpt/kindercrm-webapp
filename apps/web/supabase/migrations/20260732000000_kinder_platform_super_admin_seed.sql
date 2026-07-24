/*
 * Bootstrap Platform Super Admin (EPIC-035)
 *
 * Creates the default super admin auth user (if missing) and grants
 * `platform_admins.role = super_admin`.
 *
 * Default credentials (local / first deploy — change after login):
 *   Email:    superadmin@kinderpms.app
 *   Password: SuperAdmin123!
 *
 * Idempotent: safe to re-run (`supabase migration up` / `db reset`).
 */

create extension if not exists pgcrypto with schema extensions;

create or replace function public.bootstrap_platform_super_admin(
  p_email text default 'superadmin@kinderpms.app',
  p_password text default 'SuperAdmin123!',
  p_name text default 'Platform Super Admin'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_email text := lower(trim(p_email));
begin
  if v_email = '' then
    raise exception 'bootstrap_platform_super_admin: email is required';
  end if;

  if p_password is null or length(p_password) < 8 then
    raise exception 'bootstrap_platform_super_admin: password must be at least 8 characters';
  end if;

  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is null then
    v_user_id := extensions.uuid_generate_v4();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      extensions.uuid_generate_v4(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_email,
        'email_verified', true
      ),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  end if;

  insert into public.platform_admins (user_id, role, notes)
  values (
    v_user_id,
    'super_admin',
    'Bootstrap platform super admin'
  )
  on conflict (user_id) do update
    set
      role = 'super_admin',
      is_active = true,
      revoked_at = null;

  return v_user_id;
end;
$$;

comment on function public.bootstrap_platform_super_admin(text, text, text) is
  'Creates auth user + platform_admins super_admin row. For local bootstrap only.';

revoke all on function public.bootstrap_platform_super_admin(text, text, text)
  from public, anon, authenticated;

grant execute on function public.bootstrap_platform_super_admin(text, text, text)
  to service_role;

select public.bootstrap_platform_super_admin();
