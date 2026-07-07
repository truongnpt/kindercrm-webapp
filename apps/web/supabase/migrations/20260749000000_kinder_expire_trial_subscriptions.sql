/*
 * SUB-003: Expire trial subscriptions whose trial_ends_at has passed.
 * Called daily by /api/cron/expire-trials (Vercel Cron).
 */

create or replace function public.expire_expired_trial_subscriptions()
returns table (
  school_id uuid,
  subscription_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_now timestamptz := now();
begin
  for r in
    select ss.id, ss.school_id, ss.package_id
    from public.school_subscriptions ss
    where ss.status = 'trial'
      and ss.trial_ends_at is not null
      and ss.trial_ends_at < v_now
    for update of ss
  loop
    update public.school_subscriptions
    set
      status = 'active',
      trial_ends_at = null,
      current_period_start = v_now,
      current_period_end = null,
      updated_at = v_now
    where id = r.id;

    insert into public.school_subscription_history (
      school_id,
      package_id,
      previous_package_id,
      status,
      changed_by,
      note
    )
    values (
      r.school_id,
      r.package_id,
      r.package_id,
      'active',
      null,
      'Trial period ended (automatic)'
    );

    school_id := r.school_id;
    subscription_id := r.id;
    return next;
  end loop;
end;
$$;

comment on function public.expire_expired_trial_subscriptions() is
  'Marks expired trial subscriptions as active on their current package; writes history.';

revoke all on function public.expire_expired_trial_subscriptions() from public;
grant execute on function public.expire_expired_trial_subscriptions() to service_role;
