import {
  hasPackageFeature,
  PACKAGE_FEATURE_KEYS,
  type PackageFeature,
} from './package-features';
import type { Package } from '~/lib/kinder/types';

export const PLAN_QUOTA_KEYS = [
  'students',
  'campuses',
  'storage',
  'ai_credits',
] as const;

export type PlanQuotaKey = (typeof PLAN_QUOTA_KEYS)[number];

export type PlanComparisonRow =
  | { kind: 'quota'; key: PlanQuotaKey }
  | { kind: 'feature'; key: PackageFeature };

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  { kind: 'quota', key: 'students' },
  { kind: 'quota', key: 'campuses' },
  { kind: 'quota', key: 'storage' },
  { kind: 'quota', key: 'ai_credits' },
  ...PACKAGE_FEATURE_KEYS.map(
    (key) => ({ kind: 'feature', key }) as PlanComparisonRow,
  ),
];

export function getPackageQuotaValue(pkg: Package, key: PlanQuotaKey) {
  switch (key) {
    case 'students':
      return pkg.max_students;
    case 'campuses':
      return pkg.max_campuses;
    case 'storage':
      return pkg.max_storage_mb;
    case 'ai_credits':
      return pkg.ai_credits_monthly;
  }
}

export function isUnlimitedQuotaValue(value: number, key: PlanQuotaKey) {
  if (key === 'students' && value >= 999_999) {
    return true;
  }

  if (key === 'campuses' && value >= 999) {
    return true;
  }

  if (key === 'storage' && value >= 100_000) {
    return true;
  }

  return false;
}

export function packageIncludesComparisonFeature(
  pkg: Package | null | undefined,
  feature: PackageFeature,
) {
  return hasPackageFeature(pkg, feature);
}

export function getIncludedFeatureKeys(pkg: Package) {
  return PACKAGE_FEATURE_KEYS.filter((feature) =>
    hasPackageFeature(pkg, feature),
  );
}

export function getComparisonRowLabelKey(row: PlanComparisonRow) {
  if (row.kind === 'quota') {
    return `kinder:subscription.comparison.quotas.${row.key}`;
  }

  return `kinder:subscription.featureLabels.${row.key}`;
}

export function getPackageComparisonCell(
  pkg: Package,
  row: PlanComparisonRow,
): { type: 'boolean'; included: boolean } | { type: 'quota'; value: number } {
  if (row.kind === 'quota') {
    return { type: 'quota', value: getPackageQuotaValue(pkg, row.key) };
  }

  return {
    type: 'boolean',
    included: packageIncludesComparisonFeature(pkg, row.key),
  };
}
