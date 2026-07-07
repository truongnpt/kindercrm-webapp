import 'server-only';

import { cache } from 'react';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import type { Package } from '~/lib/kinder/types';

import { FIXED_PACKAGE_CODES } from './fixed-packages';

import type { SubscriptionHistoryEntry } from './subscription-history';

export type { SubscriptionHistoryEntry } from './subscription-history';
export { resolveSubscriptionHistoryActorLabel } from './subscription-history';

export {
  getSubscriptionDisplayStatus,
  getPastDueGraceDaysRemaining,
  getSchoolEffectivePackage,
  getTrialCalendarDaysUntilEnd,
  getTrialDaysRemaining,
  getTrialReminderKindForToday,
  hasPackageFeature,
  hasSchoolFeature,
  isActiveTrialSubscription,
  isPastDueGraceExpired,
  PACKAGE_FEATURE_KEYS,
  requirePackageFeature,
  resolveEffectivePackage,
  shouldBlockSchoolMutations,
  shouldShowBillingStatusBanner,
  shouldShowTrialBanner,
  TRIAL_AI_CREDITS_MONTHLY,
  TRIAL_BANNER_MAX_DAYS,
  type PackageFeature,
  type TrialReminderKind,
} from '~/lib/kinder/subscription/package-features';

export type { SubscriptionDisplayStatus } from '~/lib/kinder/types';

export const loadPublicPackages = cache(async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .in('code', [...FIXED_PACKAGE_CODES])
    .order('sort_order');

  if (error) {
    throw error;
  }

  return (data ?? []) as Package[];
});

export const loadSubscriptionHistory = cache(
  async (client: SupabaseClient<Database>, schoolId: string) => {
    const { data, error } = await client
      .from('school_subscription_history')
      .select(
        'id, status, note, created_at, package_id, previous_package_id, changed_by, stripe_invoice_id, stripe_invoice_url',
      )
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    const changedByIds = [
      ...new Set(
        rows
          .map((row) => row.changed_by)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const accountNameById = new Map<string, string>();

    if (changedByIds.length > 0) {
      const { data: accounts } = await client
        .from('accounts')
        .select('id, name, email')
        .in('id', changedByIds);

      for (const account of accounts ?? []) {
        accountNameById.set(
          account.id,
          account.name?.trim() || account.email || account.id,
        );
      }
    }

    return rows.map((row) => ({
      ...row,
      changed_by_name: row.changed_by
        ? (accountNameById.get(row.changed_by) ?? null)
        : null,
    })) as SubscriptionHistoryEntry[];
  },
);

export const loadSaasBillingInvoices = cache(
  async (client: SupabaseClient<Database>, schoolId: string) => {
    const { data, error } = await client
      .from('saas_billing_invoices')
      .select('*')
      .eq('school_id', schoolId)
      .order('issued_at', { ascending: false })
      .limit(24);

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);
