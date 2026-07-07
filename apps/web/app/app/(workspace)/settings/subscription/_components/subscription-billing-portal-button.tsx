'use client';

import { useTransition } from 'react';

import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { formatBillingPortalError } from '~/lib/kinder/subscription/billing-portal-messages';
import { createBillingPortalAction } from '~/lib/kinder/subscription/checkout-actions';
import type { BillingPortalIntent } from '~/lib/kinder/subscription/schemas/checkout.schema';

export function SubscriptionBillingPortalButton({
  schoolId,
  isOwner,
  intent = 'default',
  labelKey = 'kinder:subscription.manageBilling',
  size = 'default',
  variant = 'outline',
  className,
}: {
  schoolId: string;
  isOwner: boolean;
  intent?: BillingPortalIntent;
  labelKey?: string;
  size?: 'default' | 'sm';
  variant?: 'default' | 'outline';
  className?: string;
}) {
  const { t } = useTranslation('kinder');
  const [pending, startTransition] = useTransition();

  if (!isOwner) {
    return null;
  }

  return (
    <Button
      className={className ?? 'min-h-10 w-full sm:w-auto'}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const promise = createBillingPortalAction({ schoolId, intent });

          toast.promise(promise, {
            loading: t('subscription.portalLoading'),
            success: t('subscription.portalReady'),
            error: (error) =>
              formatBillingPortalError(t, error) ?? t('ui.toast.error'),
          });

          try {
            const result = await promise;

            if (result?.url) {
              window.location.href = result.url;
            }
          } catch {
            // toast handles error
          }
        });
      }}
      size={size}
      type="button"
      variant={variant}
    >
      <CreditCard className="size-4" data-icon="inline-start" />
      <Trans i18nKey={labelKey} />
    </Button>
  );
}
