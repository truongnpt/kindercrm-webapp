import 'server-only';

import { getPlatformDataClient } from './platform-data-client';

export type PlatformAnalyticsMonthRow = {
  month: string;
  monthLabel: string;
  revenueCollected: number;
  newTrials: number;
  conversions: number;
  churn: number;
};

export type PlatformSubscriptionAnalytics = {
  snapshot: {
    trialSchools: number;
    activePaidSchools: number;
    activeFreeSchools: number;
    pastDueSchools: number;
    cancelledSchools: number;
    estimatedMrr: number;
    trialConversionRate: number;
    churnRate30d: number;
  };
  months: PlatformAnalyticsMonthRow[];
};

const TIMEZONE = 'Asia/Ho_Chi_Minh';

function monthKeyFromIso(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TIMEZONE }).slice(0, 7);
}

function buildLast12MonthKeys() {
  const keys: string[] = [];
  const anchor = new Date();

  for (let offset = 11; offset >= 0; offset -= 1) {
    const date = new Date(anchor);
    date.setMonth(date.getMonth() - offset);
    keys.push(monthKeyFromIso(date.toISOString()));
  }

  return keys;
}

function monthLabelFromKey(monthKey: string) {
  const [year, month] = monthKey.split('-');
  return `${month}/${year}`;
}

function isPaidPackage(priceMonthly: number | null | undefined) {
  return (priceMonthly ?? 0) > 0;
}

export async function loadPlatformSubscriptionAnalytics(): Promise<PlatformSubscriptionAnalytics> {
  const client = getPlatformDataClient();

  const [{ data: packages }, { data: subscriptions }, { data: history }, { data: invoices }] =
    await Promise.all([
      client.from('packages').select('id, code, price_monthly'),
      client
        .from('school_subscriptions')
        .select(
          'id, school_id, status, created_at, trial_ends_at, package_id, package:packages ( price_monthly, code )',
        ),
      client
        .from('school_subscription_history')
        .select('school_id, status, package_id, previous_package_id, created_at, note')
        .order('created_at', { ascending: true }),
      client
        .from('saas_billing_invoices')
        .select('total_amount, issued_at')
        .order('issued_at', { ascending: true }),
    ]);

  const priceByPackageId = new Map(
    (packages ?? []).map((pkg) => [pkg.id, pkg.price_monthly ?? 0]),
  );
  const freePackageIds = new Set(
    (packages ?? [])
      .filter((pkg) => pkg.code === 'free' || (pkg.price_monthly ?? 0) === 0)
      .map((pkg) => pkg.id),
  );

  const subs = subscriptions ?? [];
  const historyRows = history ?? [];
  const invoiceRows = invoices ?? [];

  const trialSchools = subs.filter((sub) => sub.status === 'trial').length;
  const activePaidSchools = subs.filter((sub) => {
    const price =
      (sub.package as { price_monthly?: number } | null)?.price_monthly ??
      priceByPackageId.get(sub.package_id) ??
      0;

    return sub.status === 'active' && isPaidPackage(price);
  }).length;
  const activeFreeSchools = subs.filter((sub) => sub.status === 'active').length - activePaidSchools;
  const pastDueSchools = subs.filter((sub) => sub.status === 'past_due').length;
  const cancelledSchools = subs.filter((sub) => sub.status === 'cancelled').length;

  const estimatedMrr = subs.reduce((sum, sub) => {
    if (sub.status !== 'active') {
      return sum;
    }

    const price =
      (sub.package as { price_monthly?: number } | null)?.price_monthly ??
      priceByPackageId.get(sub.package_id) ??
      0;

    return sum + (isPaidPackage(price) ? price : 0);
  }, 0);

  const trialEndedSchools = subs.filter(
    (sub) => sub.trial_ends_at && new Date(sub.trial_ends_at) <= new Date(),
  );
  const convertedTrialSchools = trialEndedSchools.filter((sub) => {
    const price =
      (sub.package as { price_monthly?: number } | null)?.price_monthly ??
      priceByPackageId.get(sub.package_id) ??
      0;

    return sub.status === 'active' && isPaidPackage(price);
  });
  const trialConversionRate =
    trialEndedSchools.length > 0
      ? Math.round((convertedTrialSchools.length / trialEndedSchools.length) * 100)
      : 0;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const churnEvents30d = historyRows.filter(
    (row) => row.status === 'cancelled' && new Date(row.created_at).getTime() >= thirtyDaysAgo,
  ).length;
  const churnRate30d =
    activePaidSchools + churnEvents30d > 0
      ? Math.round((churnEvents30d / (activePaidSchools + churnEvents30d)) * 100)
      : 0;

  const monthKeys = buildLast12MonthKeys();
  const monthMap = new Map<string, PlatformAnalyticsMonthRow>(
    monthKeys.map((month) => [
      month,
      {
        month,
        monthLabel: monthLabelFromKey(month),
        revenueCollected: 0,
        newTrials: 0,
        conversions: 0,
        churn: 0,
      },
    ]),
  );

  for (const invoice of invoiceRows) {
    const key = monthKeyFromIso(invoice.issued_at);
    const row = monthMap.get(key);

    if (row) {
      row.revenueCollected += invoice.total_amount ?? 0;
    }
  }

  for (const sub of subs) {
    if (!sub.trial_ends_at) {
      continue;
    }

    const key = monthKeyFromIso(sub.created_at);
    const row = monthMap.get(key);

    if (row) {
      row.newTrials += 1;
    }
  }

  for (const row of historyRows) {
    const key = monthKeyFromIso(row.created_at);
    const monthRow = monthMap.get(key);

    if (!monthRow) {
      continue;
    }

    const packagePrice = priceByPackageId.get(row.package_id) ?? 0;
    const isConversion =
      row.status === 'active' &&
      isPaidPackage(packagePrice) &&
      ((row.previous_package_id && freePackageIds.has(row.previous_package_id)) ||
        row.note?.toLowerCase().includes('stripe'));

    if (isConversion) {
      monthRow.conversions += 1;
    }

    if (row.status === 'cancelled') {
      monthRow.churn += 1;
    }
  }

  return {
    snapshot: {
      trialSchools,
      activePaidSchools,
      activeFreeSchools,
      pastDueSchools,
      cancelledSchools,
      estimatedMrr,
      trialConversionRate,
      churnRate30d,
    },
    months: monthKeys.map((key) => monthMap.get(key)!),
  };
}
