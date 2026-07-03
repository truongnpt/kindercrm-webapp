import type {
  Package,
  SchoolContext,
  SchoolSubscription,
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

export function hasSchoolFeature(
  context: Pick<SchoolContext, 'package' | 'subscription'>,
  feature: PackageFeature,
) {
  return hasPackageFeature(
    context.package,
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
