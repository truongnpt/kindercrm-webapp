'use client';

import { assertStorageQuotaAction } from '~/lib/kinder/subscription/storage-actions';
import { KINDER_ERROR_CODES } from '~/lib/kinder/errors';

export async function ensureStorageQuotaBeforeUpload(
  schoolId: string,
  additionalBytes: number,
) {
  await assertStorageQuotaAction({
    schoolId,
    additionalBytes,
  });
}

export function isStorageQuotaActionError(error: unknown) {
  return (
    error instanceof Error &&
    error.message === KINDER_ERROR_CODES.STORAGE_LIMIT_REACHED
  );
}
