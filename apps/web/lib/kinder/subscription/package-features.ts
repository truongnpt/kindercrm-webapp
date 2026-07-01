import type { Package, SchoolContext } from '~/lib/kinder/types';

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
  'reports',
  'ai_assistant',
];

export function hasPackageFeature(
  pkg: Package | null | undefined,
  feature: PackageFeature,
) {
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

export function requirePackageFeature(
  context: SchoolContext,
  feature: PackageFeature,
) {
  if (!hasPackageFeature(context.package, feature)) {
    throw new Error(`Feature "${feature}" is not available on your plan`);
  }
}
