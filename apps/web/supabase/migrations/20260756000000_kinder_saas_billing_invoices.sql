/*
 * SUB-021 — SaaS VAT billing invoices (separate from school tuition finance)
 */

create sequence if not exists public.saas_invoice_number_seq start 1;

create table if not exists public.saas_billing_invoices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  package_id uuid references public.packages (id) on delete set null,
  stripe_invoice_id text not null,
  invoice_number text not null,
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  subtotal bigint not null check (subtotal >= 0),
  vat_rate numeric(5, 2) not null default 10 check (vat_rate >= 0),
  vat_amount bigint not null check (vat_amount >= 0),
  total_amount bigint not null check (total_amount >= 0),
  currency text not null default 'VND',
  package_name text not null,
  school_name text not null,
  buyer_email text,
  status text not null default 'issued' check (status in ('issued', 'sent', 'failed')),
  issued_at timestamptz not null default now(),
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint saas_billing_invoices_stripe_invoice_id_key unique (stripe_invoice_id),
  constraint saas_billing_invoices_invoice_number_key unique (invoice_number)
);

create index if not exists saas_billing_invoices_school_created_idx
  on public.saas_billing_invoices (school_id, created_at desc);

comment on table public.saas_billing_invoices is
  'VAT invoices for Kinder PMS SaaS subscription fees (SUB-021).';

alter table public.saas_billing_invoices enable row level security;

create policy saas_billing_invoices_select on public.saas_billing_invoices
  for select to authenticated
  using (school_id in (select public.get_auth_user_school_ids()));

grant select on public.saas_billing_invoices to authenticated, service_role;
grant insert, update on public.saas_billing_invoices to service_role;
grant usage, select on sequence public.saas_invoice_number_seq to service_role;

create or replace function public.next_saas_invoice_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq_val bigint;
  year_part text;
begin
  seq_val := nextval('public.saas_invoice_number_seq');
  year_part := to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'YYYY');
  return 'KC-SaaS-' || year_part || '-' || lpad(seq_val::text, 6, '0');
end;
$$;

grant execute on function public.next_saas_invoice_number() to service_role;
