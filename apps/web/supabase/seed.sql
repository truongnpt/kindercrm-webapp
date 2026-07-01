-- Packages (EPIC-002) — seed data for local development

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
    'Dùng thử và bắt đầu với trường quy mô nhỏ',
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
    '{"crm": true, "students": true, "classes": true, "finance": true, "attendance": true, "staff": true, "reports": true, "parent_portal": true, "daily_reports": true, "meal_menu": true, "inventory": true, "health_management": true, "ai_assistant": true}'::jsonb,
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

-- Storage: account avatars (from base migration)
insert into storage.buckets (id, name, public)
values ('account_image', 'account_image', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('school_logos', 'school_logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('daily_report_media', 'daily_report_media', true)
on conflict (id) do nothing;

create or replace function kit.get_storage_filename_as_uuid(name text)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
    return replace(
        storage.filename(name),
        concat('.', storage.extension(name)),
        ''
    )::uuid;
end;
$$;

grant execute on function kit.get_storage_filename_as_uuid(text) to authenticated, service_role;

drop policy if exists account_image on storage.objects;

create policy account_image on storage.objects
for all
using (
    bucket_id = 'account_image'
    and kit.get_storage_filename_as_uuid(name) = auth.uid()
)
with check (
    bucket_id = 'account_image'
    and kit.get_storage_filename_as_uuid(name) = auth.uid()
);

drop policy if exists school_logos on storage.objects;

create policy school_logos on storage.objects
for all to authenticated
using (
    bucket_id = 'school_logos'
    and (storage.foldername(name))[1]::uuid in (select public.get_auth_user_school_ids())
)
with check (
    bucket_id = 'school_logos'
    and (storage.foldername(name))[1]::uuid in (select public.get_auth_user_school_ids())
    and public.user_has_school_role(
      (storage.foldername(name))[1]::uuid,
      array['owner', 'admin']::public.school_member_role[]
    )
);
