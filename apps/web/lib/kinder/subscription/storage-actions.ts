'use server';

import { z } from 'zod';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';

import { assertStorageQuota } from './quotas';

const AssertStorageQuotaSchema = z.object({
  schoolId: z.string().uuid(),
  additionalBytes: z.coerce.number().int().min(0).default(0),
});

/** SUB-009: Pre-flight storage check before client-side uploads. */
export const assertStorageQuotaAction = enhanceAction(
  async (data, user) => {
    const context = await getSchoolContext(user.sub!);

    if (!context || context.school.id !== data.schoolId) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_ACCESS_DENIED,
        'School access denied',
      );
    }

    const client = getSupabaseServerClient();

    await assertStorageQuota(
      client,
      data.schoolId,
      context.package,
      data.additionalBytes,
    );

    return { ok: true as const };
  },
  { schema: AssertStorageQuotaSchema },
);
