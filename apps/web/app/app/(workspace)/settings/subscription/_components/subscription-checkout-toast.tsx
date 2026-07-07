'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import pathsConfig from '~/config/paths.config';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function SubscriptionCheckoutToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation('kinder');
  const checkout = searchParams.get('checkout');

  useEffect(() => {
    if (!checkout) {
      return;
    }

    if (checkout === 'success') {
      toast.success(t('subscription.checkoutSuccess'));
    }

    if (checkout === 'cancelled') {
      toast.info(t('subscription.checkoutCancelled'));
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('checkout');
    const query = params.toString();
    router.replace(
      `${pathsConfig.app.settingsSubscription}${query ? `?${query}` : ''}`,
      { scroll: false },
    );
  }, [checkout, router, searchParams, t]);

  return null;
}
