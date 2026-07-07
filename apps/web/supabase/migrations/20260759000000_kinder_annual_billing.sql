/*
 * SUB-024 — Annual billing (yearly Stripe prices + display price)
 */

alter table public.packages
  add column if not exists price_yearly bigint not null default 0,
  add column if not exists stripe_price_yearly_id text;

comment on column public.packages.price_yearly is
  'Display price for annual billing (VND). 0 = no yearly option in UI.';

comment on column public.packages.stripe_price_yearly_id is
  'Stripe Price ID for yearly recurring billing (SUB-024).';

-- Default yearly = 10 months of monthly (2 months free) for paid catalog plans.
update public.packages
set price_yearly = price_monthly * 10
where code in ('starter', 'pro')
  and price_monthly > 0
  and price_yearly = 0;
