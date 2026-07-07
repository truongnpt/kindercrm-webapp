import { KINDER_ERROR_CODES } from '~/lib/kinder/errors';

import type { QuotaFormSummary } from './quotas';

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

export function isStudentLimitError(error: unknown) {
  return isKinderErrorCode(error, KINDER_ERROR_CODES.STUDENT_LIMIT_REACHED);
}

export function isCampusLimitError(error: unknown) {
  return isKinderErrorCode(error, KINDER_ERROR_CODES.CAMPUS_LIMIT_REACHED);
}

export function isQuotaLimitError(error: unknown) {
  return isStudentLimitError(error) || isCampusLimitError(error);
}

export function formatStudentLimitToast(
  t: TranslateFn,
  summary?: Pick<QuotaFormSummary, 'limits' | 'currentPackageName' | 'students'>,
) {
  const max = summary?.limits.maxStudents;
  const plan = summary?.currentPackageName ?? '—';
  const suggested = summary?.students.suggestedPackageName;

  return t('kinder:subscription.quotaLimit.toastStudents', {
    max: max ?? '—',
    plan,
    suggested: suggested
      ? t('kinder:subscription.quotaLimit.toastSuggestedSuffix', { plan: suggested })
      : '',
  });
}

export function formatCampusLimitToast(
  t: TranslateFn,
  summary?: Pick<QuotaFormSummary, 'limits' | 'currentPackageName' | 'campuses'>,
) {
  const max = summary?.limits.maxCampuses;
  const plan = summary?.currentPackageName ?? '—';
  const suggested = summary?.campuses.suggestedPackageName;

  return t('kinder:subscription.quotaLimit.toastCampuses', {
    max: max ?? '—',
    plan,
    suggested: suggested
      ? t('kinder:subscription.quotaLimit.toastSuggestedSuffix', { plan: suggested })
      : '',
  });
}

export function formatQuotaMutationError(
  t: TranslateFn,
  error: unknown,
  summary?: QuotaFormSummary,
) {
  if (isStudentLimitError(error)) {
    return formatStudentLimitToast(t, summary);
  }

  if (isCampusLimitError(error)) {
    return formatCampusLimitToast(t, summary);
  }

  return null;
}
