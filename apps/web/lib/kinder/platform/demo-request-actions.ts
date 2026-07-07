'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';

import pathsConfig from '~/config/paths.config';
import { sendDemoRequestDecisionEmail } from '~/lib/kinder/marketing/request-demo-mail';

import { getPlatformDataClient } from './platform-data-client';
import { assertPlatformRole, requirePlatformAdmin } from './require-platform-admin';
import { ReviewDemoRequestSchema } from './schemas/demo-request.schema';

export const platformReviewDemoRequestAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, [
      'super_admin',
      'support',
      'billing',
    ]);
    assertPlatformRole(platform, ['super_admin', 'support', 'billing']);

    const client = getPlatformDataClient();

    const { data: existing, error: existingError } = await client
      .from('demo_requests')
      .select('id, school_name, email, status')
      .eq('id', data.requestId)
      .maybeSingle();

    if (existingError || !existing) {
      throw existingError ?? new Error('Demo request not found');
    }

    if (existing.status !== 'pending') {
      return { success: true, alreadyReviewed: true as const };
    }

    const { error } = await client
      .from('demo_requests')
      .update({
        status: data.decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by_user_id: user.sub,
      })
      .eq('id', data.requestId);

    if (error) {
      throw error;
    }

    try {
      await sendDemoRequestDecisionEmail({
        to: existing.email,
        schoolName: existing.school_name,
        decision: data.decision,
      });
    } catch (mailError) {
      console.error('[demo-request] decision email failed', mailError);
    }

    revalidatePath(pathsConfig.platform.demoRequests);

    return { success: true };
  },
  { schema: ReviewDemoRequestSchema },
);
