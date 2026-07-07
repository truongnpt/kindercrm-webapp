import type { Package } from '~/lib/kinder/types';

import { isFixedPackageCode } from './fixed-packages';

export type QuotaKind = 'students' | 'campuses';

export function getPackageQuotaLimit(pkg: Package, kind: QuotaKind) {
  return kind === 'students' ? pkg.max_students : pkg.max_campuses;
}

/** Smallest active package (above current tier) that fits `neededCount`. */
export function suggestUpgradePackage(
  packages: Package[],
  current: Package | null | undefined,
  kind: QuotaKind,
  neededCount: number,
): Package | null {
  const currentSort = current?.sort_order ?? -1;

  const candidates = packages
    .filter((pkg) => pkg.is_active && getPackageQuotaLimit(pkg, kind) > neededCount)
    .sort((a, b) => a.sort_order - b.sort_order);

  const paidUpgrade = candidates.find(
    (pkg) => pkg.sort_order > currentSort && pkg.price_monthly > 0,
  );

  if (paidUpgrade) {
    return paidUpgrade;
  }

  const topTier = [...candidates]
    .filter((pkg) => isFixedPackageCode(pkg.code))
    .sort((a, b) => b.sort_order - a.sort_order)[0];

  if (topTier && topTier.sort_order > currentSort) {
    return topTier;
  }

  return (
    candidates.find((pkg) => pkg.sort_order > currentSort) ?? candidates[0] ?? null
  );
}
