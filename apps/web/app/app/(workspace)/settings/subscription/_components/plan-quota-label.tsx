'use client';

import { Trans } from '@kit/ui/trans';

import {
  getPackageQuotaValue,
  isUnlimitedQuotaValue,
  type PlanQuotaKey,
} from '~/lib/kinder/subscription/package-plan-display';
import type { Package } from '~/lib/kinder/types';

export function PlanQuotaLabel({
  pkg,
  quotaKey,
}: {
  pkg: Package;
  quotaKey: PlanQuotaKey;
}) {
  const value = getPackageQuotaValue(pkg, quotaKey);

  if (isUnlimitedQuotaValue(value, quotaKey)) {
    const unlimitedKeys: Record<PlanQuotaKey, string> = {
      students: 'kinder:subscription.comparison.quotaStudentsUnlimited',
      campuses: 'kinder:subscription.comparison.quotaCampusesUnlimited',
      storage: 'kinder:subscription.comparison.quotaStorageUnlimited',
      ai_credits: 'kinder:subscription.comparison.quotaAiUnlimited',
    };

    return <Trans i18nKey={unlimitedKeys[quotaKey]} />;
  }

  if (quotaKey === 'students') {
    return (
      <Trans
        i18nKey="kinder:subscription.maxStudents"
        values={{ count: value }}
      />
    );
  }

  if (quotaKey === 'campuses') {
    return (
      <Trans
        i18nKey="kinder:subscription.maxCampuses"
        values={{ count: value }}
      />
    );
  }

  if (quotaKey === 'storage') {
    return (
      <Trans
        i18nKey="kinder:subscription.maxStorage"
        values={{ count: value }}
      />
    );
  }

  return (
    <Trans i18nKey="kinder:subscription.aiCredits" values={{ count: value }} />
  );
}

export function PlanQuotaCell({
  value,
  quotaKey,
}: {
  value: number;
  quotaKey: PlanQuotaKey;
}) {
  if (isUnlimitedQuotaValue(value, quotaKey)) {
    return <Trans i18nKey="kinder:subscription.comparison.unlimited" />;
  }

  if (quotaKey === 'storage') {
    return (
      <Trans
        i18nKey="kinder:subscription.comparison.quotaStorageValue"
        values={{ count: value }}
      />
    );
  }

  if (quotaKey === 'ai_credits') {
    return (
      <Trans
        i18nKey="kinder:subscription.comparison.quotaAiValue"
        values={{ count: value }}
      />
    );
  }

  return (
    <Trans
      i18nKey={
        quotaKey === 'students'
          ? 'kinder:subscription.comparison.quotaStudentsValue'
          : 'kinder:subscription.comparison.quotaCampusesValue'
      }
      values={{ count: value.toLocaleString() }}
    />
  );
}
