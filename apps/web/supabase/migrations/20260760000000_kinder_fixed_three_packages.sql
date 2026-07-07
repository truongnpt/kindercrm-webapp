/*
 * Fixed catalog: Free, Starter, Pro only — retire Enterprise.
 */

update public.packages
set
  description = 'Dùng thử và bắt đầu với trường mầm non quy mô nhỏ.',
  is_active = true,
  sort_order = 0
where code = 'free';

update public.packages
set
  description = 'Cho trường mầm non đang mở rộng quy mô và nhiều lớp.',
  is_active = true,
  sort_order = 1
where code = 'starter';

update public.packages
set
  description = 'Hệ thống trường nhiều chi nhánh, quota cao.',
  is_active = true,
  sort_order = 2
where code = 'pro';

-- Move any legacy Enterprise subscribers to Pro.
with pro_pkg as (
  select id from public.packages where code = 'pro' limit 1
),
enterprise_pkg as (
  select id from public.packages where code = 'enterprise' limit 1
),
moved as (
  update public.school_subscriptions ss
  set
    package_id = (select id from pro_pkg),
    updated_at = now()
  where ss.package_id = (select id from enterprise_pkg)
    and (select id from pro_pkg) is not null
  returning ss.school_id, ss.package_id
)
insert into public.school_subscription_history (
  school_id,
  package_id,
  previous_package_id,
  status,
  changed_by,
  note
)
select
  m.school_id,
  m.package_id,
  (select id from enterprise_pkg),
  ss.status,
  null,
  'Catalog update: Enterprise retired — moved to Pro'
from moved m
join public.school_subscriptions ss on ss.school_id = m.school_id;

update public.packages
set is_active = false, sort_order = 99
where code = 'enterprise';

comment on table public.packages is
  'Fixed SaaS catalog: free, starter, pro only. Additional codes may exist historically but are inactive.';
