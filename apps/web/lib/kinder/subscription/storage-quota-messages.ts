import { KINDER_ERROR_CODES } from '~/lib/kinder/errors';

export function isStorageLimitError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === KINDER_ERROR_CODES.STORAGE_LIMIT_REACHED ||
    (error.name === 'KinderError' &&
      error.message.includes('STORAGE_LIMIT_REACHED'))
  );
}

export function storageLimitMessage(
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  return t('kinder:subscription.storageLimitReached');
}
