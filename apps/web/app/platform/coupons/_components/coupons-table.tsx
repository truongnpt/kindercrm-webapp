'use client';

import { useState } from 'react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  PlatformDataTable,
  PlatformEmptyState,
  PlatformSectionCard,
} from '~/components/platform-console';
import { useKinderMutation } from '~/components/kinder-ui';
import { platformDeactivateSubscriptionCouponAction } from '~/lib/kinder/subscription/coupon-actions';

import { CouponCreateDialog } from './coupon-create-dialog';

type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent_off' | 'free_months';
  discount_value: number;
  max_redemptions: number | null;
  redemption_count: number;
  expires_at: string | null;
  is_active: boolean;
  applicable_package_codes: string[];
};

export function CouponsTable({ coupons }: { coupons: CouponRow[] }) {
  if (coupons.length === 0) {
    return (
      <PlatformEmptyState
        descriptionKey="kinder:platform.coupons.empty"
        titleKey="kinder:platform.coupons.emptyTitle"
      />
    );
  }

  return (
    <PlatformSectionCard
      action={<CouponCreateDialog />}
      title={<Trans i18nKey="kinder:platform.coupons.listTitle" />}
    >
      <PlatformDataTable>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-3 py-2 font-medium">
                <Trans i18nKey="kinder:platform.coupons.code" />
              </th>
              <th className="px-3 py-2 font-medium">
                <Trans i18nKey="kinder:platform.coupons.discount" />
              </th>
              <th className="px-3 py-2 font-medium">
                <Trans i18nKey="kinder:platform.coupons.usage" />
              </th>
              <th className="px-3 py-2 font-medium">
                <Trans i18nKey="kinder:platform.coupons.status" />
              </th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <CouponRowItem coupon={coupon} key={coupon.id} />
            ))}
          </tbody>
        </table>
      </PlatformDataTable>
    </PlatformSectionCard>
  );
}

function CouponRowItem({ coupon }: { coupon: CouponRow }) {
  const [hidden, setHidden] = useState(false);
  const deactivate = useKinderMutation({
    mutationFn: platformDeactivateSubscriptionCouponAction,
    onSuccess: () => setHidden(true),
  });

  if (hidden) {
    return null;
  }

  const usage =
    coupon.max_redemptions === null
      ? String(coupon.redemption_count)
      : `${coupon.redemption_count}/${coupon.max_redemptions}`;

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="px-3 py-3 font-mono font-medium">{coupon.code}</td>
      <td className="px-3 py-3">
        {coupon.discount_type === 'percent_off' ? (
          <Trans
            i18nKey="kinder:platform.coupons.percentOff"
            values={{ value: Number(coupon.discount_value) }}
          />
        ) : (
          <Trans
            i18nKey="kinder:platform.coupons.freeMonths"
            values={{ count: Number(coupon.discount_value) }}
          />
        )}
        {coupon.description ? (
          <p className="text-muted-foreground mt-1 text-xs">{coupon.description}</p>
        ) : null}
      </td>
      <td className="px-3 py-3">{usage}</td>
      <td className="px-3 py-3">
        <Badge variant={coupon.is_active ? 'default' : 'outline'}>
          <Trans
            i18nKey={
              coupon.is_active
                ? 'kinder:platform.coupons.active'
                : 'kinder:platform.coupons.inactive'
            }
          />
        </Badge>
      </td>
      <td className="px-3 py-3 text-right">
        {coupon.is_active ? (
          <Button
            disabled={deactivate.isPending}
            onClick={() => deactivate.mutate({ couponId: coupon.id })}
            size="sm"
            type="button"
            variant="outline"
          >
            <Trans i18nKey="kinder:platform.coupons.deactivate" />
          </Button>
        ) : null}
      </td>
    </tr>
  );
}
