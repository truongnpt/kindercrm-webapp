'use client';

import { useTranslation } from 'react-i18next';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  kinderQueryKeys,
  KinderSubmitButton,
  PricingCard,
  PricingGrid,
  useKinderMutation,
} from '~/components/kinder-ui';
import { formatVnd, formatVndAsUsdCheckout } from '~/lib/kinder/billing/format-currency';
import { isPaidCheckoutPackage } from '~/lib/kinder/billing/stripe-billing-shared';
import {
  getIncludedFeatureKeys,
  PLAN_QUOTA_KEYS,
} from '~/lib/kinder/subscription/package-plan-display';
import {
  getPackageDisplayPrice,
  getYearlyMonthlyEquivalent,
  getYearlySavingsPercent,
  type SubscriptionBillingInterval,
} from '~/lib/kinder/subscription/subscription-billing-interval';
import { createSubscriptionCheckoutAction } from '~/lib/kinder/subscription/checkout-actions';
import { changePackageAction } from '~/lib/kinder/subscription/server-actions';
import type { Package } from '~/lib/kinder/types';

import { PlanQuotaLabel } from './plan-quota-label';
import type { AppliedSubscriptionCoupon } from './subscription-coupon-field';

export function SubscriptionPlans({
  packages,
  currentPackageId,
  schoolId,
  isOwner,
  stripeEnabled,
  appliedCoupon,
  billingInterval,
  yearlyPackageIds,
  stripeVndPerUsd,
}: {
  packages: Package[];
  currentPackageId: string | null;
  schoolId: string;
  isOwner: boolean;
  stripeEnabled: boolean;
  appliedCoupon?: AppliedSubscriptionCoupon | null;
  billingInterval: SubscriptionBillingInterval;
  yearlyPackageIds: string[];
  stripeVndPerUsd: number | null;
}) {
  return (
    <PricingGrid>
      {packages.map((pkg) => (
        <PlanCard
          appliedCoupon={
            appliedCoupon?.packageId === pkg.id ? appliedCoupon : null
          }
          billingInterval={billingInterval}
          currentPackageId={currentPackageId}
          isOwner={isOwner}
          key={pkg.id}
          pkg={pkg}
          schoolId={schoolId}
          stripeEnabled={stripeEnabled}
          stripeVndPerUsd={stripeVndPerUsd}
          yearlyAvailable={yearlyPackageIds.includes(pkg.id)}
        />
      ))}
    </PricingGrid>
  );
}

function PlanCard({
  pkg,
  currentPackageId,
  schoolId,
  isOwner,
  stripeEnabled,
  appliedCoupon,
  billingInterval,
  yearlyAvailable,
  stripeVndPerUsd,
}: {
  pkg: Package;
  currentPackageId: string | null;
  schoolId: string;
  isOwner: boolean;
  stripeEnabled: boolean;
  appliedCoupon?: AppliedSubscriptionCoupon | null;
  billingInterval: SubscriptionBillingInterval;
  yearlyAvailable: boolean;
  stripeVndPerUsd: number | null;
}) {
  const { t } = useTranslation('kinder');
  const isCurrent = pkg.id === currentPackageId;
  const isRecommended = pkg.code === 'pro';
  const isYearly = billingInterval === 'yearly';
  const requiresCheckout =
    stripeEnabled && isPaidCheckoutPackage(pkg);
  const yearlyCheckoutBlocked = isYearly && requiresCheckout && !yearlyAvailable;
  const savingsPercent = getYearlySavingsPercent(pkg);

  const changePackage = useKinderMutation({
    mutationFn: changePackageAction,
    invalidateKeys: [
      kinderQueryKeys.subscription(schoolId),
      kinderQueryKeys.school(schoolId),
    ],
    toast: {
      loading: t('subscription.changing'),
      success: t('subscription.changed'),
      error: t('ui.toast.error'),
    },
  });

  const checkout = useKinderMutation({
    mutationFn: createSubscriptionCheckoutAction,
    refresh: false,
    toast: {
      loading: t('subscription.checkoutLoading'),
      success: t('subscription.checkoutRedirect'),
      error: t('ui.toast.error'),
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
  });

  const onSelect = () => {
    if (requiresCheckout) {
      checkout.mutate({
        schoolId,
        packageId: pkg.id,
        couponCode: appliedCoupon?.code,
        billingInterval,
      });
      return;
    }

    changePackage.mutate({ schoolId, packageId: pkg.id });
  };

  const isLoading = changePackage.isPending || checkout.isPending;
  const displayPrice = getPackageDisplayPrice(pkg, billingInterval);
  const yearlyMonthlyEquivalent = getYearlyMonthlyEquivalent(pkg);
  const usdCheckoutHint =
    requiresCheckout && stripeVndPerUsd
      ? formatVndAsUsdCheckout(displayPrice, stripeVndPerUsd)
      : null;

  const features = [
    ...PLAN_QUOTA_KEYS.map((quotaKey) => (
      <PlanQuotaLabel key={quotaKey} pkg={pkg} quotaKey={quotaKey} />
    )),
    ...getIncludedFeatureKeys(pkg).map((feature) => (
      <Trans
        i18nKey={`kinder:subscription.featureLabels.${feature}`}
        key={feature}
      />
    )),
  ];

  return (
    <PricingCard
      badge={
        isCurrent ? (
          <Badge className="rounded-md">
            <Trans i18nKey="kinder:subscription.current" />
          </Badge>
        ) : isRecommended ? (
          <Badge className="bg-primary/10 text-primary rounded-md border-primary/20">
            <Trans i18nKey="kinder:subscription.recommended" />
          </Badge>
        ) : isYearly && savingsPercent > 0 ? (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md border-emerald-500/20">
            <Trans
              i18nKey="kinder:subscription.billingInterval.savePercent"
              values={{ percent: savingsPercent }}
            />
          </Badge>
        ) : undefined
      }
      description={pkg.description}
      features={features}
      footer={
        isCurrent ? (
          <Button className="w-full" disabled variant="secondary">
            <Trans i18nKey="kinder:subscription.current" />
          </Button>
        ) : (
          <KinderSubmitButton
            className="w-full rounded-lg"
            disabled={!isOwner || yearlyCheckoutBlocked}
            loading={isLoading}
            onClick={onSelect}
            variant="default"
          >
            {requiresCheckout ? (
              <Trans i18nKey="kinder:subscription.checkout" />
            ) : (
              <Trans i18nKey="kinder:subscription.selectPlan" />
            )}
          </KinderSubmitButton>
        )
      }
      highlighted={isCurrent || isRecommended}
      name={pkg.name}
      price={formatVnd(displayPrice)}
      priceSuffix={
        pkg.price_monthly > 0 ? (
          isYearly ? (
            <Trans i18nKey="kinder:subscription.perYear" />
          ) : (
            <Trans i18nKey="kinder:subscription.perMonth" />
          )
        ) : (
          <Trans i18nKey="kinder:subscription.freeForever" />
        )
      }
      subPrice={
        usdCheckoutHint || (isYearly && yearlyMonthlyEquivalent > 0) ? (
          <span className="flex flex-col gap-0.5">
            {isYearly && yearlyMonthlyEquivalent > 0 ? (
              <Trans
                i18nKey="kinder:subscription.billingInterval.equivalentMonthly"
                values={{ price: formatVnd(yearlyMonthlyEquivalent) }}
              />
            ) : null}
            {usdCheckoutHint ? (
              <Trans
                i18nKey="kinder:subscription.stripeUsdHint"
                values={{ usd: usdCheckoutHint }}
              />
            ) : null}
          </span>
        ) : undefined
      }
    />
  );
}
