import type { Package } from '~/lib/kinder/types';

import { isFixedPackageCode } from '~/lib/kinder/subscription/fixed-packages';

export function isPaidCheckoutPackage(pkg: Pick<Package, 'code' | 'price_monthly'>) {
  return pkg.price_monthly > 0 && isFixedPackageCode(pkg.code);
}
