import type {
  Package,
  SchoolContext,
  SchoolSubscription,
  SubscriptionDisplayStatus,
} from '~/lib/kinder/types';

export type PackageFeature =
  | 'crm'
  | 'students'
  | 'classes'
  | 'finance'
  | 'finance_basic'
  | 'attendance'
  | 'staff'
  | 'parent_portal'
  | 'daily_reports'
  | 'meal_menu'
  | 'inventory'
  | 'health_management'
  | 'calendar'
  | 'reports'
  | 'ai_assistant';

export const PACKAGE_FEATURE_KEYS: PackageFeature[] = [
  'crm',
  'students',
  'classes',
  'finance',
  'finance_basic',
  'attendance',
  'staff',
  'parent_portal',
  'daily_reports',
  'meal_menu',
  'inventory',
  'health_management',
  'calendar',
  'reports',
  'ai_assistant',
];

/** Pro-tier AI credits while a school is in an active trial period. */
export const TRIAL_AI_CREDITS_MONTHLY = 500;

export function isActiveTrialSubscription(
  subscription: SchoolSubscription | null | undefined,
) {
  if (!subscription || subscription.status !== 'trial') {
    return false;
  }

  if (!subscription.trial_ends_at) {
    return true;
  }

  return new Date(subscription.trial_ends_at) > new Date();
}

/** SUB-018: Consistent badge label across dashboard and subscription settings. */
export function getSubscriptionDisplayStatus(
  subscription: SchoolSubscription | null | undefined,
): SubscriptionDisplayStatus | null {
  if (!subscription) {
    return null;
  }

  if (subscription.status === 'trial' && !isActiveTrialSubscription(subscription)) {
    return 'trial_expired';
  }

  return subscription.status;
}

/** Days until trial_ends_at (ceil). Null when no end date. 0 when already expired. */
export function getTrialDaysRemaining(
  subscription: SchoolSubscription | null | undefined,
) {
  if (!subscription?.trial_ends_at) {
    return null;
  }

  const diffMs =
    new Date(subscription.trial_ends_at).getTime() - Date.now();

  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export const TRIAL_BANNER_MAX_DAYS = 14;

/** Calendar days until trial_ends_at in Asia/Ho_Chi_Minh (for cron email reminders). */
export function getTrialCalendarDaysUntilEnd(trialEndsAt: string) {
  const timeZone = 'Asia/Ho_Chi_Minh';
  const endKey = new Date(trialEndsAt).toLocaleDateString('en-CA', { timeZone });
  const nowKey = new Date().toLocaleDateString('en-CA', { timeZone });
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.round((Date.parse(endKey) - Date.parse(nowKey)) / dayMs);
}

export type TrialReminderKind = 't7' | 't3' | 't1' | 'expired';

const REMINDER_KIND_BY_DAYS: Partial<Record<number, TrialReminderKind>> = {
  7: 't7',
  3: 't3',
  1: 't1',
  0: 'expired',
};

export function getTrialReminderKindForToday(
  subscription: Pick<SchoolSubscription, 'status' | 'trial_ends_at'> | null | undefined,
) {
  if (!subscription || subscription.status !== 'trial' || !subscription.trial_ends_at) {
    return null;
  }

  if (new Date(subscription.trial_ends_at) <= new Date()) {
    return null;
  }

  const daysUntilEnd = getTrialCalendarDaysUntilEnd(subscription.trial_ends_at);

  return REMINDER_KIND_BY_DAYS[daysUntilEnd] ?? null;
}

/** SUB-006: Show workspace trial banner during the last ≤14 days of an active trial. */
/** Grace days before past_due schools become read-only (server env; default 7). */
export function getPastDueGraceDays() {
  const raw = process.env.SUBSCRIPTION_PAST_DUE_GRACE_DAYS;
  const parsed = Number(raw ?? 7);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
}

export function isPastDueGraceExpired(
  subscription: SchoolSubscription | null | undefined,
) {
  if (!subscription || subscription.status !== 'past_due') {
    return false;
  }

  if (!subscription.past_due_at) {
    return false;
  }

  const graceMs = getPastDueGraceDays() * 24 * 60 * 60 * 1000;
  const elapsedMs = Date.now() - new Date(subscription.past_due_at).getTime();

  return elapsedMs > graceMs;
}

/** Days remaining in past_due grace (ceil). Null when not past_due. */
export function getPastDueGraceDaysRemaining(
  subscription: SchoolSubscription | null | undefined,
) {
  if (!subscription || subscription.status !== 'past_due' || !subscription.past_due_at) {
    return null;
  }

  const graceMs = getPastDueGraceDays() * 24 * 60 * 60 * 1000;
  const elapsedMs = Date.now() - new Date(subscription.past_due_at).getTime();
  const remainingMs = graceMs - elapsedMs;

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}

export function resolveEffectivePackage(
  billedPackage: Package | null | undefined,
  subscription: SchoolSubscription | null | undefined,
  freePackage: Package | null | undefined,
) {
  if (!subscription) {
    return billedPackage ?? freePackage ?? null;
  }

  if (subscription.status === 'cancelled') {
    return freePackage ?? billedPackage ?? null;
  }

  if (subscription.status === 'past_due' && isPastDueGraceExpired(subscription)) {
    return freePackage ?? billedPackage ?? null;
  }

  return billedPackage ?? null;
}

export function shouldBlockSchoolMutations(
  context: Pick<SchoolContext, 'subscription'>,
) {
  const subscription = context.subscription;

  if (!subscription) {
    return false;
  }

  if (subscription.status === 'cancelled') {
    return true;
  }

  return isPastDueGraceExpired(subscription);
}

export function shouldShowBillingStatusBanner(
  subscription: SchoolSubscription | null | undefined,
) {
  if (!subscription) {
    return false;
  }

  return subscription.status === 'past_due' || subscription.status === 'cancelled';
}

export function shouldShowTrialBanner(
  subscription: SchoolSubscription | null | undefined,
  pkg: Package | null | undefined,
) {
  if (!isActiveTrialSubscription(subscription)) {
    return false;
  }

  if (pkg && pkg.price_monthly > 0 && pkg.code !== 'free') {
    return false;
  }

  const daysRemaining = getTrialDaysRemaining(subscription);

  if (daysRemaining === null) {
    return true;
  }

  return daysRemaining <= TRIAL_BANNER_MAX_DAYS;
}

export function hasPackageFeature(
  pkg: Package | null | undefined,
  feature: PackageFeature,
  subscription?: SchoolSubscription | null,
) {
  if (isActiveTrialSubscription(subscription)) {
    return true;
  }

  if (!pkg) {
    return false;
  }

  const features = pkg.features as Record<string, boolean>;

  if (features.all) {
    return true;
  }

  if (feature === 'finance' && features.finance_basic) {
    return true;
  }

  return Boolean(features[feature]);
}

export function getSchoolEffectivePackage(
  context: Pick<SchoolContext, 'package' | 'effectivePackage'>,
) {
  return context.effectivePackage ?? context.package;
}

export function hasSchoolFeature(
  context: Pick<SchoolContext, 'package' | 'effectivePackage' | 'subscription'>,
  feature: PackageFeature,
) {
  return hasPackageFeature(
    getSchoolEffectivePackage(context),
    feature,
    context.subscription,
  );
}

export function requirePackageFeature(
  context: SchoolContext,
  feature: PackageFeature,
) {
  if (!hasSchoolFeature(context, feature)) {
    throw new Error(`Feature "${feature}" is not available on your plan`);
  }
}
