'use client';

import Link from 'next/link';

import { AlertTriangle, CreditCard } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { InlineAlert } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  getPastDueGraceDaysRemaining,
  isPastDueGraceExpired,
  shouldShowBillingStatusBanner,
} from '~/lib/kinder/subscription/package-features';
import type { SchoolSubscription, SubscriptionStatus } from '~/lib/kinder/types';

import { SubscriptionBillingPortalButton } from '../settings/subscription/_components/subscription-billing-portal-button';

export function BillingStatusBanner({
  subscription,
  schoolId,
  isOwner,
  stripeEnabled,
  stripeCustomerId,
}: {
  subscription: SchoolSubscription | null;
  schoolId: string;
  isOwner: boolean;
  stripeEnabled: boolean;
  stripeCustomerId: string | null;
}) {
  if (!shouldShowBillingStatusBanner(subscription)) {
    return null;
  }

  const status = subscription!.status as SubscriptionStatus;
  const graceDaysRemaining = getPastDueGraceDaysRemaining(subscription);
  const graceExpired =
    status === 'past_due' && isPastDueGraceExpired(subscription);
  const urgent =
    status === 'cancelled' ||
    graceExpired ||
    (graceDaysRemaining !== null && graceDaysRemaining <= 3);

  const showPortalCta =
    status === 'past_due' &&
    stripeEnabled &&
    Boolean(stripeCustomerId) &&
    isOwner;

  const titleKey =
    status === 'cancelled'
      ? 'kinder:subscription.billingBanner.cancelledTitle'
      : graceExpired
        ? 'kinder:subscription.billingBanner.pastDueExpiredTitle'
        : 'kinder:subscription.billingBanner.pastDueTitle';

  const messageKey =
    status === 'cancelled'
      ? 'kinder:subscription.billingBanner.cancelledMessage'
      : graceExpired
        ? 'kinder:subscription.billingBanner.pastDueExpiredMessage'
        : graceDaysRemaining === 0
          ? 'kinder:subscription.billingBanner.pastDueMessageToday'
          : graceDaysRemaining === 1
            ? 'kinder:subscription.billingBanner.pastDueMessageOneDay'
            : 'kinder:subscription.billingBanner.pastDueMessage';

  return (
    <div className="mb-6">
      <InlineAlert
        className="rounded-2xl border-destructive/20 bg-destructive/5"
        icon={status === 'past_due' && !graceExpired ? CreditCard : AlertTriangle}
        title={<Trans i18nKey={titleKey} />}
        tone={urgent ? 'warning' : 'default'}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <Trans
              i18nKey={messageKey}
              values={{
                count: graceDaysRemaining ?? 0,
              }}
            />
          </p>
          {showPortalCta ? (
            <SubscriptionBillingPortalButton
              className="shrink-0"
              intent="payment_method_update"
              isOwner={isOwner}
              labelKey="kinder:subscription.portalUpdatePayment"
              schoolId={schoolId}
              size="sm"
              variant={urgent ? 'default' : 'outline'}
            />
          ) : (
            <Button asChild className="shrink-0" size="sm" variant={urgent ? 'default' : 'outline'}>
              <Link href={pathsConfig.app.settingsSubscription}>
                <Trans i18nKey="kinder:subscription.billingBanner.manageCta" />
              </Link>
            </Button>
          )}
        </div>
      </InlineAlert>
    </div>
  );
}
