'use client';

import { Trans } from '@kit/ui/trans';

import type { SubscriptionStatus } from '~/lib/kinder/types';

import { SubscriptionBillingPortalButton } from './subscription-billing-portal-button';

export function SubscriptionBillingSection({
  schoolId,
  isOwner,
  stripeEnabled,
  stripeCustomerId,
  subscriptionStatus,
}: {
  schoolId: string;
  isOwner: boolean;
  stripeEnabled: boolean;
  stripeCustomerId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
}) {
  if (!stripeEnabled) {
    return null;
  }

  const hasCustomer = Boolean(stripeCustomerId);
  const isPastDue = subscriptionStatus === 'past_due';

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-muted/30 px-4 py-4">
      {hasCustomer && isOwner ? (
        <>
          <p className="text-muted-foreground text-sm">
            <Trans
              i18nKey={
                isPastDue
                  ? 'kinder:subscription.portalPastDueHint'
                  : 'kinder:subscription.portalHint'
              }
            />
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <SubscriptionBillingPortalButton
              intent={isPastDue ? 'payment_method_update' : 'default'}
              isOwner={isOwner}
              labelKey={
                isPastDue
                  ? 'kinder:subscription.portalUpdatePayment'
                  : 'kinder:subscription.manageBilling'
              }
              schoolId={schoolId}
              variant={isPastDue ? 'default' : 'outline'}
            />
          </div>
        </>
      ) : null}

      {!hasCustomer && isOwner ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:subscription.portalCheckoutFirst" />
        </p>
      ) : null}

      {!isOwner ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:subscription.billingOwnerOnly" />
        </p>
      ) : null}
    </div>
  );
}
