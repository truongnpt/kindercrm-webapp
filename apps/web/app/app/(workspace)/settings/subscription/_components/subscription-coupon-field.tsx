'use client';

import { useEffect, useState } from 'react';

import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import { SectionCard, useKinderMutation } from '~/components/kinder-ui';
import { isPaidCheckoutPackage } from '~/lib/kinder/billing/stripe-billing-shared';
import { validateSubscriptionCouponAction } from '~/lib/kinder/subscription/coupon-actions';
import type { Package } from '~/lib/kinder/types';

export type AppliedSubscriptionCoupon = {
  code: string;
  packageId: string;
  discountType: 'percent_off' | 'free_months';
  discountValue: number;
  description: string | null;
};

export function SubscriptionCouponField({
  schoolId,
  packages,
  currentPackageId,
  isOwner,
  stripeEnabled,
  appliedCoupon,
  onAppliedCouponChange,
}: {
  schoolId: string;
  packages: Package[];
  currentPackageId: string | null;
  isOwner: boolean;
  stripeEnabled: boolean;
  appliedCoupon: AppliedSubscriptionCoupon | null;
  onAppliedCouponChange: (coupon: AppliedSubscriptionCoupon | null) => void;
}) {
  const { t } = useTranslation('kinder');
  const [code, setCode] = useState(appliedCoupon?.code ?? '');
  const eligiblePackages = packages.filter(
    (pkg) =>
      pkg.id !== currentPackageId &&
      (!stripeEnabled || isPaidCheckoutPackage(pkg)),
  );
  const [packageId, setPackageId] = useState(
    appliedCoupon?.packageId ?? eligiblePackages[0]?.id ?? '',
  );

  useEffect(() => {
    if (!packageId && eligiblePackages[0]?.id) {
      setPackageId(eligiblePackages[0].id);
    }
  }, [eligiblePackages, packageId]);

  const validateCoupon = useKinderMutation({
    mutationFn: validateSubscriptionCouponAction,
    toast: {
      loading: t('subscription.coupon.validating'),
      success: t('subscription.coupon.applied'),
      error: (err) =>
        err instanceof Error && err.message === 'COUPON_INVALID'
          ? t('subscription.coupon.invalid')
          : t('ui.toast.error'),
    },
    onSuccess: (data) => {
      if (!data || !packageId) {
        return;
      }

      onAppliedCouponChange({
        code: data.code,
        packageId,
        discountType: data.discountType,
        discountValue: data.discountValue,
        description: data.description,
      });
    },
  });

  if (!stripeEnabled || !isOwner || eligiblePackages.length === 0) {
    return null;
  }

  const onApply = () => {
    if (!packageId || !code.trim()) {
      return;
    }

    validateCoupon.mutate({
      schoolId,
      packageId,
      couponCode: code.trim(),
    });
  };

  const onClear = () => {
    setCode('');
    onAppliedCouponChange(null);
  };

  return (
    <SectionCard className="min-w-0">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
          <Tag className="size-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-foreground font-medium">
              <Trans i18nKey="kinder:subscription.coupon.title" />
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              <Trans i18nKey="kinder:subscription.coupon.hint" />
            </p>
          </div>

          <Select onValueChange={setPackageId} value={packageId}>
            <SelectTrigger>
              <SelectValue placeholder={t('subscription.coupon.selectPlan')} />
            </SelectTrigger>
            <SelectContent>
              {eligiblePackages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              className="rounded-lg"
              disabled={validateCoupon.isPending}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder={t('subscription.coupon.placeholder')}
              value={code}
            />
            <div className="flex gap-2">
              <Button
                disabled={!packageId || !code.trim() || validateCoupon.isPending}
                onClick={onApply}
                type="button"
                variant="secondary"
              >
                <Trans i18nKey="kinder:subscription.coupon.apply" />
              </Button>
              {appliedCoupon ? (
                <Button onClick={onClear} type="button" variant="outline">
                  <Trans i18nKey="kinder:subscription.coupon.clear" />
                </Button>
              ) : null}
            </div>
          </div>

          {appliedCoupon ? (
            <p className="text-primary text-sm font-medium">
              {appliedCoupon.discountType === 'percent_off' ? (
                <Trans
                  i18nKey="kinder:subscription.coupon.summaryPercent"
                  values={{ value: appliedCoupon.discountValue }}
                />
              ) : (
                <Trans
                  i18nKey="kinder:subscription.coupon.summaryFreeMonths"
                  values={{ count: appliedCoupon.discountValue }}
                />
              )}
            </p>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
