'use client';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import type { SubscriptionBillingInterval } from '~/lib/kinder/subscription/subscription-billing-interval';

export function BillingIntervalToggle({
  value,
  onChange,
  className,
}: {
  value: SubscriptionBillingInterval;
  onChange: (interval: SubscriptionBillingInterval) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-muted inline-flex w-full rounded-lg p-1 sm:w-auto',
        className,
      )}
      role="group"
    >
      <button
        className={cn(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
          value === 'monthly'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onChange('monthly')}
        type="button"
      >
        <Trans i18nKey="kinder:subscription.billingInterval.monthly" />
      </button>
      <button
        className={cn(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
          value === 'yearly'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onChange('yearly')}
        type="button"
      >
        <Trans i18nKey="kinder:subscription.billingInterval.yearly" />
      </button>
    </div>
  );
}
