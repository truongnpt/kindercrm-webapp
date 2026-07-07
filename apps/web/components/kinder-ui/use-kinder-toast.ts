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
      error?: string | ((error: unknown) => string);
    },
  ) {
    return toast.promise(action, {
      loading: messages?.loading ?? t('ui.toast.saving'),
      success: messages?.success ?? t('ui.toast.saved'),
      error: (error) => {
        if (typeof messages?.error === 'function') {
          return messages.error(error);
        }

        return messages?.error ?? t('ui.toast.error');
      },
    });
  }

  return {
    promise,
    success: toast.success,
    error: toast.error,
    info: toast.info,
  };
}
