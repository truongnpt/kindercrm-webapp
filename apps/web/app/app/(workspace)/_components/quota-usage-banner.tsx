import Link from 'next/link';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { InlineAlert } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  bytesToMegabytes,
  formatStorageMegabytes,
} from '~/lib/kinder/subscription/quotas';
import type { Package } from '~/lib/kinder/types';

export function QuotaUsageBanner({
  package: pkg,
  usage,
  limits,
  showUpgradeLink = false,
}: {
  package: Package | null;
  usage: { campuses: number; students: number; storageBytes: number };
  limits?: { maxStorageMb: number };
  showUpgradeLink?: boolean;
}) {
  if (!pkg) {
    return null;
  }

  const maxStorageMb = limits?.maxStorageMb ?? pkg.max_storage_mb;
  const campusRatio = usage.campuses / pkg.max_campuses;
  const studentRatio = usage.students / pkg.max_students;
  const storageMb = bytesToMegabytes(usage.storageBytes);
  const storageRatio = maxStorageMb > 0 ? storageMb / maxStorageMb : 0;
  const storagePercent =
    maxStorageMb > 0 ? Math.min(100, Math.round(storageRatio * 100)) : 0;
  const showWarning =
    campusRatio >= 0.8 || studentRatio >= 0.8 || storageRatio >= 0.8;
  const storageFull = maxStorageMb > 0 && storageRatio >= 1;

  return (
    <InlineAlert
      icon={showWarning ? AlertTriangle : undefined}
      title={<Trans i18nKey="kinder:dashboard.usageTitle" />}
      tone={showWarning ? 'warning' : 'default'}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            <Trans
              i18nKey="kinder:dashboard.campusesUsed"
              values={{ used: usage.campuses, max: pkg.max_campuses }}
            />
          </span>
          <span>
            <Trans
              i18nKey="kinder:dashboard.studentsUsed"
              values={{ used: usage.students, max: pkg.max_students }}
            />
          </span>
          <span>
            <Trans
              i18nKey="kinder:subscription.storageUsed"
              values={{
                used: formatStorageMegabytes(usage.storageBytes),
                max: maxStorageMb,
                percent: storagePercent,
              }}
            />
          </span>
        </div>
        {showUpgradeLink && (storageFull || showWarning) ? (
          <div>
            <Button asChild size="sm" variant="outline">
              <Link href={pathsConfig.app.settingsSubscription}>
                <Trans i18nKey="kinder:subscription.storageUpgradeCta" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </InlineAlert>
  );
}
