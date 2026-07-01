'use client';

import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useKinderToast() {
  const { t } = useTranslation('kinder');

  function promise<T>(
    action: Promise<T>,
    messages?: {
      loading?: string;
      success?: string;
      error?: string;
    },
  ) {
    return toast.promise(action, {
      loading: messages?.loading ?? t('ui.toast.saving'),
      success: messages?.success ?? t('ui.toast.saved'),
      error: messages?.error ?? t('ui.toast.error'),
    });
  }

  return {
    promise,
    success: toast.success,
    error: toast.error,
    info: toast.info,
  };
}
