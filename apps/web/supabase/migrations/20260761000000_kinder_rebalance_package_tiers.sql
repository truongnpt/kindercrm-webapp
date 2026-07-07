/*
 * Rebalance tiers: Starter ← old Pro, Pro ← old Enterprise (catalog is 3 plans only).
 */

-- Starter: former Pro tier (multi-campus Phase 1)
update public.packages
set
  max_students = 500,
  max_campuses = 10,
  max_storage_mb = 10240,
  ai_credits_monthly = 500,
  features = '{"crm": true, "students": true, "classes": true, "finance": true, "attendance": true, "staff": true, "reports": true, "parent_portal": true, "daily_reports": true, "meal_menu": true, "inventory": true, "health_management": true, "calendar": true, "ai_assistant": true}'::jsonb,
  price_yearly = 9900000
where code = 'starter';

-- Pro: former Enterprise tier (high quota, all features)
update public.packages
set
  max_students = 999999,
  max_campuses = 999,
  max_storage_mb = 102400,
  ai_credits_monthly = 5000,
  features = '{"all": true}'::jsonb,
  price_yearly = 24900000
where code = 'pro';
