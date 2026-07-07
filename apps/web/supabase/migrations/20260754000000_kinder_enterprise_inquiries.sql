-- SUB-015: Enterprise sales inquiries from school owners

create table public.enterprise_inquiries (
  id uuid primary key default extensions.uuid_generate_v4(),
  school_id uuid not null references public.schools (id) on delete cascade,
  submitted_by_user_id uuid not null references auth.users (id) on delete restrict,
  contact_name text not null,
  phone text not null,
  campus_count integer not null check (campus_count > 0),
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_enterprise_inquiries_created
  on public.enterprise_inquiries (created_at desc);

create index idx_enterprise_inquiries_school
  on public.enterprise_inquiries (school_id);

create index idx_enterprise_inquiries_status
  on public.enterprise_inquiries (status)
  where status = 'new';

alter table public.enterprise_inquiries enable row level security;

create policy enterprise_inquiries_insert on public.enterprise_inquiries
  for insert to authenticated
  with check (
    submitted_by_user_id = auth.uid()
    and exists (
      select 1
      from public.school_members sm
      where sm.school_id = enterprise_inquiries.school_id
        and sm.user_id = auth.uid()
        and sm.role = 'owner'
        and sm.deleted_at is null
    )
  );

create policy enterprise_inquiries_select_owner on public.enterprise_inquiries
  for select to authenticated
  using (
    exists (
      select 1
      from public.school_members sm
      where sm.school_id = enterprise_inquiries.school_id
        and sm.user_id = auth.uid()
        and sm.role = 'owner'
        and sm.deleted_at is null
    )
  );

create policy enterprise_inquiries_select_platform on public.enterprise_inquiries
  for select to authenticated
  using (
    public.is_platform_admin(
      array['super_admin', 'support', 'billing']::public.platform_admin_role[]
    )
  );

comment on table public.enterprise_inquiries is
  'Sales inquiries for Enterprise plan — submitted by school owners (SUB-015).';
