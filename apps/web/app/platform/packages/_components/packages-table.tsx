'use client';

import { Package as PackageIcon } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { PlatformDataTable, PlatformEmptyState } from '~/components/platform-console';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { Package } from '~/lib/kinder/types';

import { PackageEditDialog } from './package-edit-dialog';

export function PackagesTable({ packages }: { packages: Package[] }) {
  if (packages.length === 0) {
    return (
      <PlatformEmptyState
        icon={PackageIcon}
        titleKey="kinder:platform.packages.empty"
      />
    );
  }

  return (
    <PlatformDataTable>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Limits</th>
            <th>Price</th>
            <th>Status</th>
            <th className="text-right" />
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td className="font-mono text-xs">{pkg.code}</td>
              <td className="font-medium">{pkg.name}</td>
              <td className="text-muted-foreground text-xs">
                {pkg.max_students} HS / {pkg.max_campuses} CS / {pkg.max_storage_mb} MB
              </td>
              <td>{formatVnd(pkg.price_monthly)}</td>
              <td>
                <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="text-right">
                <PackageEditDialog pkg={pkg} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PlatformDataTable>
  );
}
