import { KINDER_ERROR_CODES } from '~/lib/kinder/errors';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function isKinderErrorCode(error: unknown, code: string) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === code ||
    (error.name === 'KinderError' && error.message.includes(code))
  );
}

export function formatBillingPortalError(t: TranslateFn, error: unknown) {
  if (isKinderErrorCode(error, KINDER_ERROR_CODES.PERMISSION_DENIED)) {
    return t('kinder:subscription.portalOwnerOnly');
  }

  if (isKinderErrorCode(error, KINDER_ERROR_CODES.SUBSCRIPTION_NOT_FOUND)) {
    return t('kinder:subscription.portalNoCustomer');
  }

  if (isKinderErrorCode(error, KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE)) {
    return t('kinder:subscription.portalNotConfigured');
  }

  return null;
}
